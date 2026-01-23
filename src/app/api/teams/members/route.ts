"use server";

import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";
import Team from "@/schemas/mongoose/Team";
import User from "@/schemas/mongoose/User";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";
import SubTeam from "@/schemas/mongoose/SubTeam";

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromToken(req);

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(userId).select("team");
    if (!user || !user.team) {
      return NextResponse.json(
        { error: "User is not in any team" },
        { status: 404 }
      );
    }

    const team = await Team.findById(user.team);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const allUserIds = [...team.members, ...(team.pendingUsers || [])];
    const uniqueUserIds = Array.from(
      new Set(allUserIds.map((id) => id.toString()))
    );

    if (uniqueUserIds.length === 0) {
      return NextResponse.json(
        { message: "No members or pending users in the team" },
        { status: 404 }
      );
    }

    const memberDetails = await User.find({ _id: { $in: uniqueUserIds } })
      .select("-password")
      .lean();

    for (const member of memberDetails) {
      if (member.subTeam && isValidObjectId(member.subTeam)) {
        const subTeam = await SubTeam.findById(member.subTeam).select("name");
        member.subTeam = subTeam
          ? { _id: subTeam._id, name: subTeam.name }
          : null;
      } else {
        member.subTeam = null;
      }
    }

    return NextResponse.json({ members: memberDetails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
