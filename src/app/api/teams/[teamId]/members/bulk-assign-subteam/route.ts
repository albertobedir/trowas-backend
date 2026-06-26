import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import Team from "@/schemas/mongoose/Team";
import mongoose from "mongoose";
import SubTeam from "@/schemas/mongoose/SubTeam";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    await dbConnect();

    const { teamId } = await params;
    const { memberIds, subteamId } = await req.json();

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: "memberIds required" },
        { status: 400 },
      );
    }

    if (!subteamId) {
      return NextResponse.json(
        { error: "subteamId required" },
        { status: 400 },
      );
    }

    const subTeam = await SubTeam.findById(subteamId);
    if (!subTeam) {
      return NextResponse.json({ error: "Subteam not found" }, { status: 404 });
    }

    const users = await User.find({
      _id: { $in: memberIds },
      team: teamId,
    });

    let updatedCount = 0;

    for (const user of users) {
      // ✅ subteam ekle (array)
      if (!user.subTeams.includes(subteamId)) {
        user.subTeams.push(subteamId);
      }

      // ✅ subteam.members sync
      if (!subTeam.members.includes(user._id)) {
        subTeam.members.push(user._id);
      }

      // ✅ permissions (same senin çalışan API)
      if (typeof subTeam.permissions === "string") {
        user.permissions.subTeamPermission = (
          BigInt(user.permissions.subTeamPermission || 0n) |
          BigInt(subTeam.permissions)
        ).toString();
      }

      await user.save();
      updatedCount++;
    }

    await subTeam.save();

    return NextResponse.json({
      message: "Bulk subteam assign success",
      updated: updatedCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
