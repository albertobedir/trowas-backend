"use server";

import { NextResponse } from "next/server";
import User from "@/schemas/mongoose/User";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/admin/require-admin";
import { AdminUserListQuerySchema } from "@/schemas/zod/admin/user";
import type { FilterQuery } from "mongoose";

export async function GET(req: Request) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query = AdminUserListQuerySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      accountType: searchParams.get("accountType") ?? undefined,
      userRole: searchParams.get("userRole") ?? undefined,
      isVipMember: searchParams.get("isVipMember") ?? undefined,
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

    const {
      search,
      accountType,
      userRole,
      isVipMember,
      sortBy,
      sortOrder,
      page,
      limit,
    } = query.data;

    const filter: FilterQuery<typeof User> = {};

    if (search?.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
        { username: { $regex: term, $options: "i" } },
      ];
    }

    if (accountType !== "all") {
      filter.accountType = accountType;
    }

    if (userRole !== "all") {
      filter["roles.userRole"] = userRole;
    }

    if (isVipMember !== "all") {
      filter.isVipMember = isVipMember === "true";
    }

    const sortField =
      sortBy === "accountType" ? "accountType" : sortBy;
    const sort: Record<string, 1 | -1> = {
      [sortField]: sortOrder === "asc" ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select(
          "name email username accountType isVipMember roles.userRole profileImage createdAt uniqueUrlName",
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
