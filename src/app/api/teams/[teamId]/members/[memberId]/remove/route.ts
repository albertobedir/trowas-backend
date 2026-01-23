"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import User from "@/schemas/mongoose/User";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";
import { getUserIfTeamRoleAllowed } from "@/utils/decorators/team-role.decorator";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const { teamId, memberId } = await params;
    const session = await getUserIfTeamRoleAllowed(req, ["owner", "manager"]);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized or Forbidden" },
        { status: 403 }
      );
    }
    await dbConnect();

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const user = await User.findById(memberId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!team.members.includes(memberId)) {
      return NextResponse.json(
        { error: "User is not a member of the specified team" },
        { status: 404 }
      );
    }

    team.members = team.members.filter(
      (member: string) => member.toString() !== memberId
    );
    await team.save();

    user.team = null;
    user.teamRole = null;
    user.permissions = null;
    await user.save();

    return NextResponse.json(
      { message: "User removed from the team successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
