import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserCard from "@/schemas/mongoose/UserCard";
import CardTemplate from "@/schemas/mongoose/Template"; // Template modelini import ediyoruz
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import User from "@/schemas/mongoose/User";
import { isValidObjectId } from "mongoose";
import { getUserIfTeamRoleAllowed } from "@/utils/decorators/team-role.decorator";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const url = new URL(req.url);
    const indexParam = url.searchParams.get("index");
    const cardIndex = Number(indexParam);

    const sessionId = await getUserIdFromToken(req);
    if (!sessionId || !isValidObjectId(sessionId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    if (Number.isNaN(cardIndex) || cardIndex < 0) {
          return NextResponse.json(
            { error: "Invalid or missing index query parameter" },
            { status: 400 }
          );
        }
    await dbConnect();

    const body = await req.json();
    console.log(body);

    const user = await User.findById(userId);
    if (!user || !isValidObjectId(user.userCard.at(cardIndex).cardId)) {
      return NextResponse.json(
        { error: "User or UserCard not found" },
        { status: 404 }
      );
    }

    const userCard = await UserCard.findOne({
      _id: user.userCard.at(cardIndex).cardId,
      user: userId,
    });

    if (!userCard) {
      return NextResponse.json(
        { error: "UserCard not found" },
        { status: 404 }
      );
    }

    // Yetki kontrolü
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

    // Eğer body içinde templateId varsa, Template'i buluyoruz
    if (body.templateId && isValidObjectId(body.templateId)) {
      const template = await CardTemplate.findById(body.templateId);
      if (!template) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        );
      }
      // Eğer template bulunduysa, template'in links objesini alıyoruz
      userCard.links = template.links;
    } else {
      userCard.links = body;
    }

    // Güncellenmiş UserCard'ı kaydediyoruz
    await userCard.save();

    return NextResponse.json({
      message: "Links updated successfully",
      links: userCard.links,
    });
  } catch (err) {
    console.error("Update links error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
