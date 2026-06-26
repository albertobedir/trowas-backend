"use server";

import { NextResponse } from "next/server";
import Team from "@/schemas/mongoose/Team";
import User from "@/schemas/mongoose/User";
import SubTeam from "@/schemas/mongoose/SubTeam";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/admin/require-admin";
import { AdminTeamListQuerySchema } from "@/schemas/zod/admin/team";
import type { FilterQuery } from "mongoose";

export async function GET(req: Request) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query = AdminTeamListQuerySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder: searchParams.get("sortOrder") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!query.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: query.error.format() },
        { status: 400 },
      );
    }

    const { search, sortBy, sortOrder, page, limit } = query.data;
    const filter: FilterQuery<typeof Team> = {};

    if (search?.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: "i" } },
        { "teamSettings.customSubdomain": { $regex: term, $options: "i" } },
        { "teamSettings.allowedEmailDomain": { $regex: term, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    if (sortBy === "memberCount") {
      const teams = await Team.find(filter)
        .populate("owner", "name email")
        .sort({ createdAt: sortOrder === "asc" ? 1 : -1 })
        .lean();

      const teamsWithCounts = await Promise.all(
        teams.map(async (team) => {
          const [memberCount, subteamCount] = await Promise.all([
            User.countDocuments({ team: team._id }),
            SubTeam.countDocuments({ parentTeam: team._id }),
          ]);
          return { ...team, memberCount, subteamCount };
        }),
      );

      teamsWithCounts.sort((a, b) => {
        const diff = (a.memberCount ?? 0) - (b.memberCount ?? 0);
        return sortOrder === "asc" ? diff : -diff;
      });

      const paginated = teamsWithCounts.slice(skip, skip + limit);
      const total = teamsWithCounts.length;

      return NextResponse.json({
        teams: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const [teams, total] = await Promise.all([
      Team.find(filter)
        .populate("owner", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Team.countDocuments(filter),
    ]);

    const teamsWithCounts = await Promise.all(
      teams.map(async (team) => {
        const [memberCount, subteamCount] = await Promise.all([
          User.countDocuments({ team: team._id }),
          SubTeam.countDocuments({ parentTeam: team._id }),
        ]);
        return { ...team, memberCount, subteamCount };
      }),
    );

    return NextResponse.json({
      teams: teamsWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin teams list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
