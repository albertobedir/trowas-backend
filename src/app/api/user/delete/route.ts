"use server";

import { NextResponse } from "next/server";
import User from "@/schemas/mongoose/User";
import DigitCode from "@/schemas/mongoose/DigitCode";
import Team from "@/schemas/mongoose/Team";
import SubTeam from "@/schemas/mongoose/SubTeam";
import UserCard from "@/schemas/mongoose/UserCard";
import dbConnect from "@/lib/db";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";

export async function DELETE(req: Request) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const teamsOwnedByUser = await Team.find({ owner: userId });

    for (const team of teamsOwnedByUser) {
      team.members = team.members.filter(
        (memberId: any) => memberId.toString() !== userId.toString()
      );

      if (team.members.length === 0) {
        await Team.findByIdAndDelete(team._id);
      } else {
        const newOwnerId = team.members[0];
        await Team.findByIdAndUpdate(team._id, {
          owner: newOwnerId,
          members: team.members,
        });

        const newOwner = await User.findById(newOwnerId);
        if (newOwner) {
          newOwner.roles.teamRole = "owner";
          newOwner.permissions.teamPermission = 6;
          await newOwner.save();
        }
      }
    }

    await Team.updateMany({ members: userId }, { $pull: { members: userId } });

    await SubTeam.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    await UserCard.deleteMany({ user: userId });

    await DigitCode.deleteMany({ email: user.email });

    await User.findByIdAndDelete(userId);

    return NextResponse.json(
      { message: "User and related data deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
