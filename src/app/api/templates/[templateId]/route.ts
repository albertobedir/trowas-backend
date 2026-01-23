"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { isValidObjectId } from "mongoose";
import CardTemplate from "@/schemas/mongoose/Template";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;

    if (!templateId || !isValidObjectId(templateId)) {
      return NextResponse.json(
        { error: "Invalid or missing team ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const template = await CardTemplate.findById(templateId);
    if (!template) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ template }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
