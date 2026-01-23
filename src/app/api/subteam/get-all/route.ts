"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SubTeam from "@/schemas/mongoose/SubTeam";
import Team from "@/schemas/mongoose/Team";
import { isValidObjectId } from "mongoose";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");

    if (!teamId || !isValidObjectId(teamId)) {
      return NextResponse.json(
        { error: "Invalid or missing team ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const teamExists = await Team.exists({ _id: teamId });
    if (!teamExists) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const subTeams = await SubTeam.find({ parentTeam: teamId });

    return NextResponse.json({ subTeams }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving subteams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
