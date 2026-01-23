"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CardTemplate from "@/schemas/mongoose/Template";
import User from "@/schemas/mongoose/User";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) => {
  try {
    const userId = await getUserIdFromToken(req);
    const { templateId } = await params;

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isValidObjectId(templateId)) {
      return NextResponse.json(
        { error: "Invalid template ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const session = await User.findById(userId);

    if (!session || !session.team) {
      return NextResponse.json(
        { error: "User not part of any team" },
        { status: 403 }
      );
    }

    const template = await CardTemplate.findById(templateId);

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    if (template.team.toString() !== session.team.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await CardTemplate.findByIdAndDelete(templateId);

    return NextResponse.json(
      { message: "Template deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
