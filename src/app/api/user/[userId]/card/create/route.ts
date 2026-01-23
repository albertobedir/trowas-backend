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

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromToken(req);

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

     const qrBuffer = await generateQRCodeBuffer(
      `${process.env.BASE_URL}connect/${user._id}`,
      "svg"
    );

    const qrCodePath = await saveBufferFile(
      qrBuffer,
      user._id,
      {},
      "svg",
      "qrCodes"
    );

    // Kullanıcı kartı oluştur
    const newCard = await UserCard.create({
      cardName: `${user.name}'s card`,
      user: user._id,
      template:  {},
      name: user.name,
      jobTitle: null,
      company: null,
      location: null,
      bio: null,
      font: "Baskerville",
      linkColor: "#000000",
      cardColor: "#ffffff",
      matchLinkIconsToTheme: false,
      profilePicture: "/defaultpp.png",
      coverPhoto: "/defaultcover.jpg",
      companyLogo: "/defaultcompanylogo.png",
      qrCodeUrl: `${qrCodePath}`,
      links: [],
    });


    if (!user.userCard) user.userCard = [];
    user.userCard.push({
      cardName: newCard.cardName,
      cardProfileImage: newCard.profilePicture,
      cardTeamTemplate: null,
      cardId: newCard._id,
      jopTitle: newCard.jobTitle,});
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
