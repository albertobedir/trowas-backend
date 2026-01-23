import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import { isValidObjectId } from "mongoose";
import User from "@/schemas/mongoose/User";

export async function GET(
  req: Request,
  { params,  }: { params: Promise<{ userId: string }>}
) {
  try {
    const { userId } = await params;
    const url = new URL(req.url);
    const indexParam = url.searchParams.get("index");
    const from = url.searchParams.get("from") || undefined;
    const cardIndex = Number(indexParam);

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json(
        { error: "Invalid or missing userId" },
        { status: 400 }
      );
    }

    // Validate index
    if (Number.isNaN(cardIndex) || cardIndex < 0) {
      return NextResponse.json(
        { error: "Invalid or missing index query parameter" },
        { status: 400 }
      );
    }

    await dbConnect();
    const member = await User.findById(userId);
    if (!member) {
      return NextResponse.json({ error: "member not found" }, { status: 404 });
    }
    const team = await Team.findById(member.team).populate("members");
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const userIsMember = team.members.some(
      (member: { id: string }) => member.id.toString() === userId
    );

    if (!userIsMember) {
      return NextResponse.json(
        { error: "User is not a member of this team" },
        { status: 403 }
      );
    }

    const userCardId = member.userCard?.[cardIndex];
    if (!userCardId || !isValidObjectId(userCardId)) {
      return NextResponse.json(
        { error: "Card not found at provided index" },
        { status: 404 }
      );
    }

    const existingViewIndex = team.teamPerformance.cardConnects.findIndex(
      (cv: { userId: string; userCardId: string }) =>
        cv.userId.toString() === userId &&
        cv.userCardId.toString() === userCardId.toString()
    );

    if (existingViewIndex !== -1) {
      team.teamPerformance.cardConnects[existingViewIndex].conenct += 1;
      // Optionally update `from` if provided and not already set
      if (from) {
        team.teamPerformance.cardConnects[existingViewIndex].from = from;
      }
    } else {
      team.teamPerformance.cardConnects.push({
        userId,
        userCardId,
        conenct: 1,
        ...(from && { from }),
      });
    }

    await team.save();

    return NextResponse.json({
      message: "Card view incremented successfully",
      cardConnect: team.teamPerformance.cardConnects,
    });
  } catch (err) {
    console.error("Error incrementing card views:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
