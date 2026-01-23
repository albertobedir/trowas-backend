"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import UserCard from "@/schemas/mongoose/UserCard";
import { generateQRCodeBuffer } from "@/utils/generate-qr-code";
import { saveBufferFile } from "@/utils/upload/save-buffer";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";
import { cardBodySchema } from "@/schemas/zod/user";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = await getUserIdFromToken(req);

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const body = cardBodySchema.parse(json);

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const qrBuffer = await generateQRCodeBuffer(
      `${process.env.BASE_URL}connect/${user._id}/${Date.now()}`,
      "svg"
    );

    const qrCodePath = await saveBufferFile(
      qrBuffer,
      user.id,
      {},
      "svg",
      "qrCodes"
    );

    const newCard = await UserCard.create({
      user: user._id,
      cardName: body.cardName ?? `${user.name}'s card`,
      name: body.name ?? user.name,
      jobTitle: body.jobTitle ?? null,
      company: body.company ?? null,
      location: body.location ?? null,
      bio: body.bio ?? null,
      font: body.font ?? "Baskerville",
      linkColor: body.linkColor ?? "#000000",
      cardColor: body.cardColor ?? "#ffffff",
      matchLinkIconsToTheme: body.matchLinkIconsToTheme ?? false,
      profilePicture: "/defaultpp.png",
      coverPhoto: "/defaultcover.jpg",
      companyLogo: "/defaultcompanylogo.png",
      qrCodeUrl: qrCodePath,
      links: body.links ?? {},
    });

    if (!user.userCards) user.userCards = [];
    user.userCards.push(newCard._id);
    await user.save();

    return NextResponse.json({ userCard: newCard }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: err.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
