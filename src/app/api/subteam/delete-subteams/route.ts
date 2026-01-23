"use server";

import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import SubTeam from "@/schemas/mongoose/SubTeam";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getUserIfTeamRoleAllowed } from "@/utils/decorators/team-role.decorator";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    await dbConnect();

    const { teamId } = await params;
    const { subTeamIds } = await req.json();

    if (
      !teamId ||
      !subTeamIds ||
      !Array.isArray(subTeamIds) ||
      subTeamIds.length === 0
    ) {
      return NextResponse.json(
        { error: "teamId and subTeamIds are required" },
        { status: 400 }
      );
    }

    const user = await getUserIfTeamRoleAllowed(req, ["owner", "manager"]);
    if (!user || !isValidObjectId(user._id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Takımı bul
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (
      user.team?.toString() !== teamId &&
      team.owner.toString() !== user._id.toString()
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const validSubTeamIds = subTeamIds.filter((id: string) =>
      team.subteams.some((subteamId: any) => subteamId.toString() === id)
    );

    if (validSubTeamIds.length === 0) {
      return NextResponse.json(
        { error: "No valid subteams found to delete" },
        { status: 400 }
      );
    }

    await SubTeam.deleteMany({
      _id: { $in: validSubTeamIds },
      parentTeam: teamId,
    });

    team.subteams = team.subteams.filter(
      (subteamId: any) => !validSubTeamIds.includes(subteamId.toString())
    );
    await team.save();

    return NextResponse.json(
      { message: `${validSubTeamIds.length} subteams deleted successfully.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting subteams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
