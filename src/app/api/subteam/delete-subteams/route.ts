"use server";

import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import SubTeam from "@/schemas/mongoose/SubTeam";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getUserIfTeamRoleAllowed } from "@/utils/decorators/team-role.decorator";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { teamId, subTeamIds } = body;

    // Basic validation
    if (
      !teamId ||
      !isValidObjectId(teamId) ||
      !Array.isArray(subTeamIds) ||
      subTeamIds.length === 0
    ) {
      return NextResponse.json(
        { error: "teamId and subTeamIds are required" },
        { status: 400 },
      );
    }

    // Auth check (only owner/manager)
    const user = await getUserIfTeamRoleAllowed(req, ["owner", "manager"]);

    if (!user || !isValidObjectId(user._id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Team'i bul
    const team = await Team.findById(teamId);

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Yetki kontrolü
    const isOwner = team.owner.toString() === user._id.toString();

    const isSameTeam = user.team?.toString() === teamId;

    if (!isOwner && !isSameTeam) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Sadece bu team'e ait olan subteamleri filtrele
    const validSubTeamIds = subTeamIds.filter((id: string) =>
      team.subteams.some((subId: any) => subId.toString() === id),
    );

    if (validSubTeamIds.length === 0) {
      return NextResponse.json(
        { error: "No valid subteams found to delete" },
        { status: 400 },
      );
    }

    // Subteamleri sil
    await SubTeam.deleteMany({
      _id: { $in: validSubTeamIds },
      parentTeam: teamId,
    });

    // Team içinden referansları kaldır
    team.subteams = team.subteams.filter(
      (subId: any) => !validSubTeamIds.includes(subId.toString()),
    );

    await team.save();

    return NextResponse.json(
      {
        message: `${validSubTeamIds.length} subteams deleted successfully`,
        deleted: validSubTeamIds,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting subteams:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
