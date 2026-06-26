"use server";

import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/admin/require-admin";
import { updateSubteamMembers } from "@/lib/admin/subteam-members";
import { buildAdminSubteamResponse } from "@/lib/admin/subteam-response";

type RouteContext = { params: Promise<{ subTeamId: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { subTeamId } = await params;
    if (!isValidObjectId(subTeamId)) {
      return NextResponse.json(
        { error: "Invalid sub-team ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const add = Array.isArray(body.add) ? body.add : [];
    const remove = Array.isArray(body.remove) ? body.remove : [];

    if (add.length === 0 && remove.length === 0) {
      return NextResponse.json(
        { error: "No members to add or remove" },
        { status: 400 },
      );
    }

    await dbConnect();
    await updateSubteamMembers(subTeamId, add, remove);

    const response = await buildAdminSubteamResponse(subTeamId);
    if (!response) {
      return NextResponse.json(
        { error: "Sub-team not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin subteam members error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
