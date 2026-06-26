"use server";

import { NextResponse } from "next/server";
import User from "@/schemas/mongoose/User";
import Team from "@/schemas/mongoose/Team";
import Lead from "@/schemas/mongoose/Lead";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function GET(req: Request) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await dbConnect();

    const [total, individual, corporate, vip, admins, teams, leads] =
      await Promise.all([
      User.countDocuments(),
      User.countDocuments({ accountType: "individual" }),
      User.countDocuments({ accountType: "corporate" }),
      User.countDocuments({ isVipMember: true }),
      User.countDocuments({ "roles.userRole": "admin" }),
      Team.countDocuments(),
      Lead.countDocuments(),
    ]);

    return NextResponse.json({
      total,
      individual,
      corporate,
      vip,
      admins,
      teams,
      leads,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
