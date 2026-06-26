"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import UserCard from "@/schemas/mongoose/UserCard";
import { isValidObjectId } from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const url = new URL(req.url);

    const isVip = url.searchParams.get("isVip") === "true";
    const returnAllParam = url.searchParams.get("returnAll") === "true";
    const indexParam = url.searchParams.get("index");
    // If index is not provided (null) we should return all cards by default.
    const shouldReturnAll = returnAllParam || indexParam === null;
    const cardIndex = indexParam !== null ? parseInt(indexParam, 10) : 0;

    await dbConnect();

    let user;
    if (isVip) {
      user = await User.findOne({ uniqueUrlName: userId });
    } else {
      if (!userId || !isValidObjectId(userId)) {
        return NextResponse.json(
          { error: "Geçersiz veya eksik kullanıcı ID'si" },
          { status: 400 },
        );
      }
      user = await User.findById(userId);
    }

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 },
      );
    }

    const userCards = await UserCard.find({ user: user._id });

    if (!userCards.length) {
      return NextResponse.json(
        { error: "Kullanıcının kartı bulunamadı" },
        { status: 404 },
      );
    }

    if (shouldReturnAll) {
      return NextResponse.json(
        { userCards, username: user.username },
        { status: 200 },
      );
    }

    if (isNaN(cardIndex) || cardIndex < 0 || cardIndex >= userCards.length) {
      return NextResponse.json(
        { error: "Geçersiz veya eksik kart index'i" },
        { status: 400 },
      );
    }

    const selectedCard = userCards[cardIndex];

    return NextResponse.json(
      {
        userCard: selectedCard,
        username: user.username,
        emailSignature: user.emailSignature || null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
