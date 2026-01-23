"use server";

import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import User from "@/schemas/mongoose/User";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getUserIfTeamRoleAllowed } from "@/utils/decorators/team-role.decorator";
import { hash } from "bcryptjs";

interface TeamType {
  members: (string | { toString(): string })[];
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    await dbConnect();

    const { memberIds, newPassword } = await req.json();
    const { teamId } = await params;

    const user = await getUserIfTeamRoleAllowed(req, ["owner", "manager"]);

    if (!user || !isValidObjectId(user._id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: "memberIds array is required" },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const team = (await Team.findById(teamId)
      .select("members")
      .lean()) as TeamType | null;

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const validMemberIds = memberIds.filter((id) =>
      team.members.some((memberId) => memberId.toString() === id)
    );
    if (validMemberIds.length === 0) {
      return NextResponse.json(
        { error: "No valid team members found in memberIds" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(newPassword, 10);

    const result = await User.updateMany(
      { _id: { $in: validMemberIds } },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json(
      { message: `${result.modifiedCount} users password updated.` },
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
