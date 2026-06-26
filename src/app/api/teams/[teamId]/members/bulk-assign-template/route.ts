import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import UserCard from "@/schemas/mongoose/UserCard";
import { isValidObjectId, Types } from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    await dbConnect();

    const { teamId } = await params;
    const body = await req.json();

    const { memberIds, templateId } = body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: "memberIds required" },
        { status: 400 },
      );
    }

    if (!isValidObjectId(templateId)) {
      return NextResponse.json(
        { error: "Invalid templateId" },
        { status: 400 },
      );
    }

    const results = await Promise.all(
      memberIds.map(async (memberId: string) => {
        if (!isValidObjectId(memberId)) return null;

        const user = await User.findById(memberId);
        if (!user) return null;

        if (user.team?.toString() !== teamId) return null;

        // 1) USER
        user.template = templateId;

        // 2) USERCARDS
        const cards = await UserCard.find({ user: memberId });

        for (const card of cards) {
          // 🔥 FIX: object olarak yaz
          card.teamTemplate = {
            templateId: new Types.ObjectId(templateId),
          };

          await card.save();
        }

        // 3) UI mapping fix
        if (Array.isArray(user.userCard)) {
          user.userCard = user.userCard.map((c: any) => ({
            ...c,
            cardTeamTemplate: templateId,
          }));
        }

        await user.save();

        return user;
      }),
    );

    return NextResponse.json({
      message: "Bulk template updated",
      updated: results.filter(Boolean).length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
