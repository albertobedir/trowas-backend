"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import UserCard from "@/schemas/mongoose/UserCard";
import { generateQRCodeBuffer } from "@/utils/generate-qr-code";
import { saveBufferFile } from "@/utils/upload/save-buffer";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isAdminFromRequest } from "@/utils/decorators/admin-decorator";
import { isValidObjectId } from "mongoose";
import { cardBodySchema } from "@/schemas/zod/user";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const isAdmin = await isAdminFromRequest(req);
    const { userId: paramUserId } = await params;
    const sessionUserId = isAdmin ? null : await getUserIdFromToken(req);

    if (
      !isAdmin &&
      (!sessionUserId || !isValidObjectId(sessionUserId))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = isAdmin ? paramUserId : sessionUserId!;

    if (!isValidObjectId(targetUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const json = await req.json();
    const body = cardBodySchema.parse(json);

    await dbConnect();

    const user = await User.findById(targetUserId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cardIndex = user.userCard?.length || 0;

    const qrBuffer = await generateQRCodeBuffer(
      `${process.env.BASE_URL}connect/${user._id}?index=${cardIndex}`,
      "svg",
    );

    const qrCodePath = await saveBufferFile(
      qrBuffer,
      user.id,
      {},
      "svg",
      "qrCodes",
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
      links: [],
    });

    if (!user.userCard) user.userCard = [];
    user.userCard.push({
      cardName: newCard.cardName,
      cardProfileImage: newCard.profilePicture ?? "/defaultpp.png",
      cardTeamTemplate: (body as any).teamTemplateId ?? null,
      cardId: newCard._id,
    });
    await user.save();

    return NextResponse.json({ userCard: newCard }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: err.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
