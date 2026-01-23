"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import UserCard from "@/schemas/mongoose/UserCard";
import Team from "@/schemas/mongoose/Team";
import { isValidObjectId } from "mongoose";

export async function POST(req: Request) {
  try {
    const { userId, linkName } = await req.json();

    if (
      !userId ||
      !isValidObjectId(userId) ||
      !linkName ||
      typeof linkName !== "string"
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userCard = await UserCard.findOne({ user: userId });
    if (!userCard) {
      return NextResponse.json(
        { error: "UserCard not found" },
        { status: 404 }
      );
    }

    const team = await Team.findById(user.team);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (!Array.isArray(team.teamPerformance.linkTaps)) {
      team.teamPerformance.linkTaps = [];
    }

    const existingTapIndex = team.teamPerformance.linkTaps.findIndex(
      (tap: any) =>
        tap.userCardId?.toString() === userCard._id.toString() &&
        tap.linkName === linkName
    );

    if (existingTapIndex > -1) {
      team.teamPerformance.linkTaps[existingTapIndex].taps =
        (team.teamPerformance.linkTaps[existingTapIndex].taps || 0) + 1;
    } else {
      team.teamPerformance.linkTaps.push({
        linkName,
        userId: user._id,
        userCardId: userCard._id,
        taps: 1,
      });
    }

    await team.save();

    return NextResponse.json({ message: "Link tap recorded" }, { status: 200 });
  } catch (err) {
    console.error("Error saving link tap:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
