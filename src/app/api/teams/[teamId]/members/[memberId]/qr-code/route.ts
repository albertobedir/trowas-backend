import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserCard from "@/schemas/mongoose/UserCard";
import { isValidObjectId } from "mongoose";
import path from "path";
import fs from "fs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string; memberId: string }> },
) {
  try {
    await dbConnect();

    const { memberId } = await params;

    if (!isValidObjectId(memberId)) {
      return NextResponse.json({ error: "Invalid memberId" }, { status: 400 });
    }

    const card = await UserCard.findOne({ user: memberId }).sort({
      createdAt: 1,
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (!card.qrCodeUrl) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), "public", card.qrCodeUrl);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 },
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename=qr-code.svg`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
