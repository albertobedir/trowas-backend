"use server";

import { NextResponse } from "next/server";
import { isValidObjectId, Types } from "mongoose";
import type { FilterQuery } from "mongoose";
import Lead from "@/schemas/mongoose/Lead";
import Team from "@/schemas/mongoose/Team";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/admin/require-admin";
import { AdminLeadListQuerySchema } from "@/schemas/zod/admin/lead";
import {
  extractLeadEmail,
  extractLeadPhone,
  extractLeadTitle,
  normalizeLeadData,
} from "@/lib/admin/lead-utils";

export async function GET(req: Request) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query = AdminLeadListQuerySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      teamId: searchParams.get("teamId") ?? undefined,
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

    const { search, teamId, sortBy, sortOrder, page, limit } = query.data;
    const filter: FilterQuery<typeof Lead> = {};

    if (teamId && teamId !== "all") {
      if (!isValidObjectId(teamId)) {
        return NextResponse.json(
          { error: "Invalid team ID" },
          { status: 400 },
        );
      }
      filter.teamId = new Types.ObjectId(teamId);
    }

    if (search?.trim()) {
      const term = search.trim();
      filter.$or = [
        { "user.name": { $regex: term, $options: "i" } },
        { "leadData.Full Name": { $regex: term, $options: "i" } },
        { "leadData.name": { $regex: term, $options: "i" } },
        { "leadData.Name": { $regex: term, $options: "i" } },
        { "leadData.firstName": { $regex: term, $options: "i" } },
        { "leadData.lastName": { $regex: term, $options: "i" } },
        { "leadData.Email": { $regex: term, $options: "i" } },
        { "leadData.email": { $regex: term, $options: "i" } },
        { "leadData.phone": { $regex: term, $options: "i" } },
        { "leadData.Phone": { $regex: term, $options: "i" } },
        { "leadData.phoneNumber": { $regex: term, $options: "i" } },
        { "leadData.company": { $regex: term, $options: "i" } },
        { "leadData.Company": { $regex: term, $options: "i" } },
      ];
    }

    const sortField =
      sortBy === "userName" ? "user.name" : sortBy === "title" ? "createdAt" : "createdAt";
    const sort: Record<string, 1 | -1> = {
      [sortField]: sortOrder === "asc" ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    let rawLeads;
    if (sortBy === "title") {
      rawLeads = await Lead.aggregate([
        { $match: filter },
        {
          $addFields: {
            sortTitle: {
              $ifNull: [
                "$leadData.Full Name",
                {
                  $ifNull: [
                    "$leadData.name",
                    {
                      $ifNull: ["$leadData.Name", "$leadData.email"],
                    },
                  ],
                },
              ],
            },
          },
        },
        { $sort: { sortTitle: sortOrder === "asc" ? 1 : -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
    } else {
      rawLeads = await Lead.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();
    }

    const total = await Lead.countDocuments(filter);

    const teamIds = [
      ...new Set(
        rawLeads
          .map((lead) => lead.teamId?.toString())
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const teams = teamIds.length
      ? await Team.find({ _id: { $in: teamIds } })
          .select("name")
          .lean()
      : [];

    const teamNameById = new Map(
      teams.map((team) => [team._id.toString(), team.name]),
    );

    const leads = rawLeads.map((lead: (typeof rawLeads)[number]) => {
      const leadData = normalizeLeadData(lead.leadData);
      const teamIdStr = lead.teamId?.toString();

      return {
        _id: lead._id,
        title: extractLeadTitle(leadData),
        email: extractLeadEmail(leadData),
        phone: extractLeadPhone(leadData),
        type:
          typeof leadData.type === "string"
            ? leadData.type
            : typeof (lead as { type?: string }).type === "string"
              ? (lead as { type?: string }).type
              : undefined,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
        sendAfter: lead.sendAfter,
        user: lead.user
          ? {
              id: lead.user.id,
              name: lead.user.name,
              profileImage: lead.user.profileImage,
            }
          : null,
        team: teamIdStr
          ? {
              _id: teamIdStr,
              name: teamNameById.get(teamIdStr) || "Unknown Team",
            }
          : null,
      };
    });

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin leads list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
