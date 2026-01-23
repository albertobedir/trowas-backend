import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import UserCard from "@/schemas/mongoose/UserCard";
import CardTemplate from "@/schemas/mongoose/Template";
import { isValidObjectId } from "mongoose";
import { getUserIfTeamRoleAllowed } from "@/utils/decorators/team-role.decorator";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionId = await getUserIdFromToken(req);
    if (!sessionId || ! isValidObjectId(sessionId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const indexParam = url.searchParams.get("index");
    const cardIndex = indexParam ? parseInt(indexParam, 10) : 0;
    const { userId } = await params;
    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await dbConnect();

    const body = await req.json();

     const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!isValidObjectId(user.userCard.at(cardIndex)?.cardId)) {
      return NextResponse.json({ error: "Invalid card ID" }, { status: 400 });
    }

    const userCard = await UserCard.findOne({
      _id:user.userCard.at(cardIndex)?.cardId,
      user: userId,
    });

    if (!userCard) {
      return NextResponse.json(
        { error: "UserCard not found" },
        { status: 404 }
      );
    }

    if (sessionId !== userId) {
      const userWithRole = await getUserIfTeamRoleAllowed(req, [
        "owner",
        "manager",
      ]);
      if (!userWithRole) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (user.roles.teamRole === "pending" && sessionId !== userId) {
      return NextResponse.json(
        { error: "User is pending and cannot be updated by others" },
        { status: 403 }
      );
    }

    // Eğer body'de templateId varsa
    if (body.templateId && isValidObjectId(body.templateId)) {
      const template = await CardTemplate.findById(body.templateId);
      if (!template) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        );
      }

      // Template'in leadForm'ını userCard'a ekliyoruz
      userCard.leadForm = template.leadForm;
    } else {
      // Eğer leadForm doğrudan gönderildiyse, bunu kullanıyoruz
      userCard.leadForm = body;
    }

    await userCard.save();

    return NextResponse.json({
      message: "Lead form updated",
      leadForm: userCard.leadForm,
    });
  } catch (err) {
    console.error("Update lead form error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
