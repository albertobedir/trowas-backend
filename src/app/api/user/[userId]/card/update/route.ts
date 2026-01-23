"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserCard from "@/schemas/mongoose/UserCard";
import CardTemplate from "@/schemas/mongoose/Template";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";
import { UserCardUpdateSchema } from "@/schemas/zod/user";
import User from "@/schemas/mongoose/User";
import Team from "@/schemas/mongoose/Team";
import { saveFile } from "@/utils/upload";
import { getUserIfTeamRoleAllowed } from "@/utils/decorators/team-role.decorator";

function getString(formData: FormData, key: string): string | undefined {
  const val = formData.get(key);
  return typeof val === "string" && val.trim() !== "" ? val : undefined;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionId = await getUserIdFromToken(req);
    if (!sessionId || !isValidObjectId(sessionId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const { userId } = await params;
    const indexParam = url.searchParams.get("index");
    const cardIndex = indexParam ? parseInt(indexParam, 10) : 0;

    await dbConnect();
    const formData = await req.formData();

    const rawFields: any = {
      teamTemplateId: getString(formData, "teamTemplateId"),
      name: getString(formData, "name"),
      cardLayout: getString(formData, "cardLayout"),
      call: getString(formData, "call"),
      email: getString(formData, "email"),
      cardName: getString(formData, "cardName"),
      jobTitle: getString(formData, "jobTitle"),
      company: getString(formData, "company"),
      location: getString(formData, "location"),
      bio: getString(formData, "bio"),
      font: getString(formData, "font"),
      linkColor: getString(formData, "linkColor"),
      cardTheme: getString(formData, "cardTheme"),
      matchLinkIconsToTheme: formData.get("matchLinkIconsToTheme") === "true",
    };

    // Yeni: emailData'yı al
    const emailData = {
      to: JSON.parse(getString(formData, "emailData.to") || "[]"),
      subject: getString(formData, "emailData.subject") || "",
      message: getString(formData, "emailData.message") || "",
      isActive: formData.get("emailData.isActive") === "true",
      sendAfterHour: getString(formData, "emailData.sendAfterHour") || "",
      sendAfterMinute: getString(formData, "emailData.sendAfterMinute") || "",
    };

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!isValidObjectId(user.userCard.at(cardIndex)?.cardId)) {
      return NextResponse.json({ error: "Invalid card ID" }, { status: 400 });
    }

    const validation = UserCardUpdateSchema.safeParse({
      permission: user.permissions.subTeamPermission,
      ...rawFields,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => ({
        message: err.message,
        path: err.path.join("."),
      }));
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { teamTemplateId, ...updateFields } = validation.data;

    const userCard = await UserCard.findOne({
      _id: user.userCard.at(cardIndex)?.cardId,
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

    if (teamTemplateId) {
      const team = await Team.findById(user.team);
      if (!team) {
        return NextResponse.json(
          { error: "User team not found" },
          { status: 404 }
        );
      }

      const templateExists = team.templates.some(
        (templateId: string) => templateId.toString() === teamTemplateId
      );
      if (!templateExists) {
        return NextResponse.json(
          { error: "Template not allowed for team" },
          { status: 400 }
        );
      }

      const teamTemplate = await CardTemplate.findById(teamTemplateId);
      if (!teamTemplate) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        );
      }

      userCard.teamTemplate.templateId = teamTemplateId;
      userCard.teamTemplate.templateName = teamTemplate.templateName;
      user.userCard.cardTeamTemplate = teamTemplateId;
      user.userCard.links = teamTemplate.links;
      user.userCard.leadForm = teamTemplate.leadForm;
      user.userCard.profilePicture = teamTemplate.profilePicture;
      await user.save();

      const overwriteFields = [
        "cardLayout",
        "company",
        "location",
        "bio",
        "call",
        "email",
        "font",
        "linkColor",
        "cardTheme",
        "matchLinkIconsToTheme",
        "profilePicture",
        "coverPhoto",
        "companyLogo",
        "qrCodeUrl",
        "jobTitle",
      ];

      overwriteFields.forEach((field) => {
        if (teamTemplate[field] !== undefined) {
          userCard[field] = teamTemplate[field];
        }
      });

      if (teamTemplate.links && teamTemplate.links.length > 0) {
        userCard.links = teamTemplate.links.map((link: any) => ({
          type: link.type,
          url: link.url,
        }));
      }

      if (teamTemplate.leadForm) {
        userCard.leadForm = teamTemplate.leadForm;
      }
    }

    const fileMap = {
      profilePicture: formData.get("profilePicture"),
      coverPhoto: formData.get("coverPhoto"),
      companyLogo: formData.get("companyLogo"),
    };

    for (const [key, file] of Object.entries(fileMap)) {
      if (file instanceof File) {
        const url = await saveFile(
          file,
          userId,
          { userCard: userCard.id },
          "webp"
        );
        userCard[key] = url;
      }
    }

    if (fileMap.profilePicture instanceof File) {
      user.profileImage = userCard.profilePicture;
      await user.save();
    }

    for (const [key, value] of Object.entries(updateFields)) {
      if (value !== undefined) {
        userCard[key] = value;
      }
    }

    user.userCard.at(cardIndex).cardName = updateFields.cardName;
    user.userCard.at(cardIndex).cardLayout = updateFields.cardLayout;
    user.userCard.at(cardIndex).cardProfileImage = userCard.profilePicture;
    user.userCard.at(cardIndex).call = userCard.call;
    user.userCard.at(cardIndex).email = userCard.email;

    // Yeni: emailData güncelle
    if (emailData.to.length > 0 || emailData.subject || emailData.message) {
      userCard.emailData = emailData;
    }

    await user.save();
    await userCard.save();

    return NextResponse.json({ message: "UserCard updated", userCard });
  } catch (err) {
    console.error("UserCard update error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
