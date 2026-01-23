"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EmailSignature from "@/schemas/mongoose/EmailSignature";
import User from "@/schemas/mongoose/User";
import { isValidObjectId } from "mongoose";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ signatureId: string }> }
) {
  try {
    await dbConnect();

    const userId = await getUserIdFromToken(req);
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { signatureId } = await params;
    if (!isValidObjectId(signatureId)) {
      return NextResponse.json(
        { error: "Invalid signatureId" },
        { status: 400 }
      );
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const signature = await EmailSignature.findById(signatureId);
    if (!signature) {
      return NextResponse.json(
        { error: "EmailSignature not found" },
        { status: 404 }
      );
    }

    if (
      !currentUser.team ||
      signature.team.toString() !== currentUser.team.toString()
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (currentUser.role !== "owner" && currentUser.role !== "manager") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await EmailSignature.findByIdAndDelete(signatureId);

    return NextResponse.json(
      { message: "EmailSignature deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting EmailSignature:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
