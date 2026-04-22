"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import UserCard from "@/schemas/mongoose/UserCard";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";
import { getUserIfTeamRoleAllowed } from "@/utils/decorators/team-role.decorator";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const url = new URL(req.url);
    const indexParam = url.searchParams.get("index");
    const cardIndex = indexParam ? parseInt(indexParam, 10) : 0;

    const sessionId = await getUserIdFromToken(req);
    if (!sessionId || !isValidObjectId(sessionId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (Number.isNaN(cardIndex) || cardIndex < 0) {
      return NextResponse.json(
        { error: "Invalid or missing index query parameter" },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userCardArray = Array.isArray(user.userCard) ? user.userCard : [];

    // Try to resolve cardId from mapping first
    let cardIdToUse: any = null;
    if (
      Number.isInteger(cardIndex) &&
      cardIndex >= 0 &&
      cardIndex < userCardArray.length
    ) {
      const cardRef = userCardArray[cardIndex];
      if (cardRef && cardRef.cardId && isValidObjectId(cardRef.cardId)) {
        cardIdToUse = cardRef.cardId;
      }
    }

    // Fallback to DB list
    if (!cardIdToUse) {
      const userCardsFromDb = await UserCard.find({ user: userId }).sort({
        createdAt: 1,
      });
      if (!userCardsFromDb.length) {
        return NextResponse.json(
          { error: "User has no cards" },
          { status: 404 },
        );
      }
      if (
        Number.isNaN(cardIndex) ||
        cardIndex < 0 ||
        cardIndex >= userCardsFromDb.length
      ) {
        return NextResponse.json(
          { error: "Invalid card index" },
          { status: 400 },
        );
      }
      cardIdToUse = userCardsFromDb[cardIndex]._id;
    }

    const userCard = await UserCard.findOne({ _id: cardIdToUse, user: userId });
    if (!userCard) {
      return NextResponse.json(
        { error: "UserCard not found" },
        { status: 404 },
      );
    }

    // Authorization: owner or allowed team roles
    if (sessionId !== userId) {
      const userWithRole = await getUserIfTeamRoleAllowed(req, [
        "owner",
        "manager",
      ]);
      if (!userWithRole) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (user.roles.teamRole === "pending" && sessionId !== userId) {
      return NextResponse.json(
        { error: "User is pending and cannot be updated by others" },
        { status: 403 },
      );
    }

    // Delete the UserCard document
    await UserCard.deleteOne({ _id: cardIdToUse, user: userId });

    // Update user's mapping: remove any entries referencing this cardId
    const mappingIndex = userCardArray.findIndex(
      (ref: any) =>
        ref && ref.cardId && String(ref.cardId) === String(cardIdToUse),
    );
    if (mappingIndex !== -1) {
      user.userCard.splice(mappingIndex, 1);
      await user.save();
    }

    return NextResponse.json({ message: "UserCard deleted" }, { status: 200 });
  } catch (err) {
    console.error("Delete card error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
