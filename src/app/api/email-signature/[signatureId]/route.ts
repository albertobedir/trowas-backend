"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EmailSignature from "@/schemas/mongoose/EmailSignature";
import { isValidObjectId } from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ signatureId: string }> }
) {
  try {
    const { signatureId } = await params;

    if (!isValidObjectId(signatureId)) {
      return NextResponse.json(
        { error: "Invalid signature ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const signature = await EmailSignature.findById(signatureId).populate(
      "users",
      "name email"
    );

    if (!signature) {
      return NextResponse.json(
        { error: "Signature not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ signature }, { status: 200 });
  } catch (error) {
    console.error("Error fetching signature:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
