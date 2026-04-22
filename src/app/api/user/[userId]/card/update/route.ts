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
  { params }: { params: Promise<{ userId: string }> },
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

    const userCardArray = Array.isArray(user.userCard) ? user.userCard : [];

    // Resolve cardId from mapping first, otherwise fallback to DB list
    let cardIdToUse: any = null;
    if (
      Number.isInteger(cardIndex) &&
      cardIndex >= 0 &&
      cardIndex < userCardArray.length
    ) {
      const cardRef = userCardArray[cardIndex];
      if (cardRef && cardRef.cardId && isValidObjectId(cardRef.cardId)) {
        cardIdToUse = cardRef.cardId;
      }
    }

    if (!cardIdToUse) {
      const userCardsFromDb = await UserCard.find({ user: userId }).sort({
        createdAt: 1,
      });
      if (!userCardsFromDb.length) {
        return NextResponse.json(
          { error: "User has no cards" },
          { status: 404 },
        );
      }
      if (
        Number.isNaN(cardIndex) ||
        cardIndex < 0 ||
        cardIndex >= userCardsFromDb.length
      ) {
        return NextResponse.json(
          { error: "Invalid card index" },
          { status: 400 },
        );
      }
      cardIdToUse = userCardsFromDb[cardIndex]._id;
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
        { status: 400 },
      );
    }

    const { teamTemplateId, ...updateFields } = validation.data;

    const userCard = await UserCard.findOne({ _id: cardIdToUse, user: userId });
    if (!userCard) {
      return NextResponse.json(
        { error: "UserCard not found" },
        { status: 404 },
      );
    }

    // Determine mapping index in user.userCard for this cardId
    let mappingIndex = -1;
    if (
      userCardArray[cardIndex] &&
      String(userCardArray[cardIndex].cardId) === String(cardIdToUse)
    ) {
      mappingIndex = cardIndex;
    } else {
      mappingIndex = userCardArray.findIndex(
        (ref: any) =>
          ref && ref.cardId && String(ref.cardId) === String(cardIdToUse),
      );
    }
    if (mappingIndex === -1) {
      user.userCard.push({
        cardName: userCard.cardName,
        cardProfileImage: userCard.profilePicture || "/defaultpp.png",
        cardTeamTemplate: userCard.teamTemplate?.templateId ?? null,
        cardId: userCard._id,
      });
      mappingIndex = user.userCard.length - 1;
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
        { status: 403 },
      );
    }

    if (teamTemplateId) {
      const team = await Team.findById(user.team);
      if (!team) {
        return NextResponse.json(
          { error: "User team not found" },
          { status: 404 },
        );
      }

      const templateExists = team.templates.some(
        (templateId: string) => templateId.toString() === teamTemplateId,
      );
      if (!templateExists) {
        return NextResponse.json(
          { error: "Template not allowed for team" },
          { status: 400 },
        );
      }

      const teamTemplate = await CardTemplate.findById(teamTemplateId);
      if (!teamTemplate) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 },
        );
      }

      userCard.teamTemplate.templateId = teamTemplateId;
      userCard.teamTemplate.templateName = teamTemplate.templateName;
      // update mapping entry for this card
      if (mappingIndex !== -1) {
        user.userCard[mappingIndex].cardTeamTemplate = teamTemplateId;
        user.userCard[mappingIndex].cardProfileImage =
          teamTemplate.profilePicture ||
          user.userCard[mappingIndex].cardProfileImage;
      }
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
          "webp",
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

    user.userCard[mappingIndex].cardName = updateFields.cardName;
    user.userCard[mappingIndex].cardLayout = updateFields.cardLayout;
    user.userCard[mappingIndex].cardProfileImage = userCard.profilePicture;
    user.userCard[mappingIndex].call = userCard.call;
    user.userCard[mappingIndex].email = userCard.email;

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
      { status: 500 },
    );
  }
}
