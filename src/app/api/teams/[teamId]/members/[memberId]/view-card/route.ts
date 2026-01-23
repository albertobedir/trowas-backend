import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import { isValidObjectId } from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const { teamId, memberId } = await params;

    if (!memberId || !isValidObjectId(memberId)) {
      return NextResponse.json(
        { error: "Invalid or missing memberId" },
        { status: 400 }
      );
    }

    if (!isValidObjectId(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    await dbConnect();

    // Team'i bul
    const team = await Team.findById(teamId).populate("members");
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // User'in team'de olup olmadığını kontrol et
    const userIsMember = team.members.some(
      (member: { id: string }) => member.id.toString() === memberId
    );

    if (!userIsMember) {
      return NextResponse.json(
        { error: "User is not a member of this team" },
        { status: 403 }
      );
    }

    // Card Views sayısını 1 artır
    team.teamPerformance.cardViews += 1;

    // Yeni cardViews değerini kaydet
    await team.save();

    return NextResponse.json({
      message: "Card view incremented successfully",
      cardViews: team.teamPerformance.cardViews,
    });
  } catch (err) {
    console.error("Error incrementing card views:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
