"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import { isValidObjectId } from "mongoose";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ subTeamId: string; memberId: string }> }
) {
  try {
    const { subTeamId, memberId } = await params;
    const { isManager } = await req.json();

    if (!subTeamId || !isValidObjectId(subTeamId)) {
      return NextResponse.json({ error: "Invalid subTeamId" }, { status: 400 });
    }

    if (!memberId || typeof isManager !== "boolean") {
      return NextResponse.json(
        { error: "Missing or invalid userId / isManager" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(memberId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const roleIndex = user.roles.subTeamRole.findIndex(
      (r: any) => r.subTeamId.toString() === subTeamId
    );

    if (roleIndex === -1) {
      return NextResponse.json(
        { error: "SubTeam role entry not found in user" },
        { status: 404 }
      );
    }

    const currentRole = user.roles.subTeamRole[roleIndex].role;

    if (isManager && currentRole === "member") {
      user.roles.subTeamRole[roleIndex].role = "manager";
    } else if (!isManager && currentRole === "manager") {
      user.roles.subTeamRole[roleIndex].role = "member";
    } else {
      return NextResponse.json(
        { message: "No update needed, role already matches desired state" },
        { status: 200 }
      );
    }

    await user.save();

    return NextResponse.json(
      { message: "Role updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating subteam role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
