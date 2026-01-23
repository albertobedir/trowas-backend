"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SubTeam from "@/schemas/mongoose/SubTeam";
import { isValidObjectId } from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ subTeamId: string }> }
) {
  try {
    const { subTeamId } = await params;

    if (!subTeamId || !isValidObjectId(subTeamId)) {
      return NextResponse.json(
        { error: "Invalid or missing subteam ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const subTeam = await SubTeam.findById(subTeamId);
    if (!subTeam) {
      return NextResponse.json({ error: "SubTeam not found" }, { status: 404 });
    }

    return NextResponse.json({ subTeam }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving subteam:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
