import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import User from "@/schemas/mongoose/User";
import { isValidObjectId } from "mongoose";

export async function GET(
  req: Request,
  { params,  }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const url = new URL(req.url);
    const indexParam = url.searchParams.get("index");
    const from = url.searchParams.get("from") || undefined;
    const cardIndex = Number(indexParam);

    // Validate userId
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
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const team = await Team.findById(member.team).populate("members");
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Confirm membership
    const userIsMember = team.members.some(
      (m: { id: string }) => m.id.toString() === userId
    );
    if (!userIsMember) {
      return NextResponse.json(
        { error: "User is not a member of this team" },
        { status: 403 }
      );
    }

    // Fetch cardId from user's card list via index
    const userCardId = member.userCard?.[cardIndex];
    if (!userCardId || !isValidObjectId(userCardId)) {
      return NextResponse.json(
        { error: "Card not found at provided index" },
        { status: 404 }
      );
    }

    // Update / insert view record
    const existingViewIndex = team.teamPerformance.cardViews.findIndex(
      (cv: { userId: string; userCardId: string }) =>
        cv.userId.toString() === userId &&
        cv.userCardId.toString() === userCardId.toString()
    );

    if (existingViewIndex !== -1) {
      team.teamPerformance.cardViews[existingViewIndex].views += 1;
      // Optionally update `from` if provided and not already set
      if (from) {
        team.teamPerformance.cardViews[existingViewIndex].from = from;
      }
    } else {
      team.teamPerformance.cardViews.push({
        userId,
        userCardId,
        views: 1,
        ...(from && { from }),
      });
    }

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
