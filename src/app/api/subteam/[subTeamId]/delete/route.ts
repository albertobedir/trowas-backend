"use server";

import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import SubTeam from "@/schemas/mongoose/SubTeam";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ subTeamId: string }> }
) {
  try {
    const { subTeamId } = await params;
    const userId = await getUserIdFromToken(req);

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subTeam = await SubTeam.findById(subTeamId);
    if (!subTeam) {
      return NextResponse.json({ error: "SubTeam not found" }, { status: 404 });
    }

    const isOwnerOfParentTeam =
      subTeam.parentTeam.toString() === user.team.toString() &&
      (user.roles.teamRole === "owner" || user.roles.teamRole === "manager");

    if (!isOwnerOfParentTeam) {
      return NextResponse.json(
        {
          error:
            "Unauthorized action: User is not owner or manager of the parent team",
        },
        { status: 403 }
      );
    }

    await User.updateMany(
      { _id: { $in: subTeam.members } },
      { $pull: { subTeams: subTeamId } }
    );

    await SubTeam.findByIdAndDelete(subTeamId);

    return NextResponse.json(
      { message: "SubTeam deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting subteam:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
