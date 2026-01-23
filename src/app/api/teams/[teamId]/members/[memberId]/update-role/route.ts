"use server";

import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import User from "@/schemas/mongoose/User";
import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";
import { TeamRole, upgradeRole } from "@/lib/permissions";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    await dbConnect();

    const { teamId, memberId } = await params;
    const query_role = new URL(req.url).searchParams.get("role");
    const userId = await getUserIdFromToken(req);
    const toRole = TeamRole[query_role?.toUpperCase() as keyof typeof TeamRole];

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await User.findById(userId);

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const member = await User.findById(memberId);
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (member.team && member.team.toString() !== teamId) {
      // Eski takımdan çıkart
      const oldTeam = await Team.findById(member.team);
      if (oldTeam) {
        oldTeam.members = oldTeam.members.filter(
          (id: string) => id.toString() !== memberId
        );
        await oldTeam.save();
      }

      member.team = teamId;
      member.roles.teamRole = "pending";
      member.permissions.teamPermission = 1;
      await member.save();

      team.members.push(memberId);
      await team.save();
    }

    if (team.pendingUsers && team.pendingUsers.includes(memberId)) {
      team.pendingUsers = team.pendingUsers.filter(
        (id: any) => id.toString() !== memberId.toString()
      );
      await team.save();
    }

    const result = await upgradeRole(
      member.permissions.teamPermission,
      toRole,
      memberId
    );

    if (result instanceof NextResponse) {
      return result;
    }

    return NextResponse.json(
      { message: "Role updated successfully." },
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
