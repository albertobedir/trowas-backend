"use server";

import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import UserCard from "@/schemas/mongoose/UserCard";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/admin/require-admin";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { userId } = await params;

    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await dbConnect();

    const cards = await UserCard.find({ user: userId })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Admin list user cards error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
