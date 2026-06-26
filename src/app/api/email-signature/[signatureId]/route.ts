"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EmailSignature from "@/schemas/mongoose/EmailSignature";
import User from "@/schemas/mongoose/User";
import { isValidObjectId } from "mongoose";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ signatureId: string }> }
) {
  try {
    const userId = await getUserIdFromToken(req);

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { signatureId } = await params;

    if (!isValidObjectId(signatureId)) {
      return NextResponse.json(
        { error: "Invalid signature ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const currentUser = await User.findById(userId).select("team roles");
    if (!currentUser?.team) {
      return NextResponse.json({ error: "User has no team" }, { status: 403 });
    }

    const signature = await EmailSignature.findById(signatureId).populate(
      "users",
      "name email profileImage"
    );

    if (!signature) {
      return NextResponse.json(
        { error: "Signature not found" },
        { status: 404 }
      );
    }

    if (signature.team.toString() !== currentUser.team.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
