"use server";

import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import User from "@/schemas/mongoose/User";
import UserCard from "@/schemas/mongoose/UserCard";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/admin/require-admin";
import { AdminUserCardUpdateSchema } from "@/schemas/zod/admin/user-card";
import { saveFile } from "@/utils/upload";

type RouteContext = {
  params: Promise<{ userId: string; cardId: string }>;
};

function getStringField(formData: FormData, key: string): string | undefined {
  const val = formData.get(key);
  return typeof val === "string" && val.trim() !== "" ? val : undefined;
}

function getNullableStringField(
  formData: FormData,
  key: string,
): string | null | undefined {
  const val = formData.get(key);
  if (val === null || val === undefined) return undefined;
  if (typeof val !== "string") return undefined;
  if (val === "__null__") return null;
  return val.trim() === "" ? null : val;
}

function getBooleanField(formData: FormData, key: string): boolean | undefined {
  const val = formData.get(key);
  if (val === "true") return true;
  if (val === "false") return false;
  return undefined;
}

function parseJsonField<T>(raw: string | undefined, field: string): T | undefined {
  if (!raw?.trim()) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Invalid JSON for ${field}`);
  }
}

async function syncUserCardMapping(userId: string, userCard: InstanceType<typeof UserCard>) {
  const user = await User.findById(userId);
  if (!user) return;

  const mappingIndex = user.userCard.findIndex(
    (ref: { cardId?: { toString: () => string } }) =>
      ref?.cardId && String(ref.cardId) === String(userCard._id),
  );

  if (mappingIndex === -1) {
    user.userCard.push({
      cardName: userCard.cardName,
      cardProfileImage: userCard.profilePicture || "/defaultpp.png",
      cardTeamTemplate: userCard.teamTemplate?.templateId ?? null,
      cardId: userCard._id,
    });
  } else {
    user.userCard[mappingIndex].cardName = userCard.cardName;
    user.userCard[mappingIndex].cardProfileImage =
      userCard.profilePicture || user.userCard[mappingIndex].cardProfileImage;
    if (userCard.teamTemplate?.templateId) {
      user.userCard[mappingIndex].cardTeamTemplate =
        userCard.teamTemplate.templateId;
    }
  }

  await user.save();
}

export async function GET(req: Request, { params }: RouteContext) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { userId, cardId } = await params;

    if (!isValidObjectId(userId) || !isValidObjectId(cardId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await dbConnect();

    const card = await UserCard.findOne({ _id: cardId, user: userId }).lean();
    if (!card) {
      return NextResponse.json({ error: "User card not found" }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error("Admin get user card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { userId, cardId } = await params;

    if (!isValidObjectId(userId) || !isValidObjectId(cardId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await dbConnect();

    const userCard = await UserCard.findOne({ _id: cardId, user: userId });
    if (!userCard) {
      return NextResponse.json({ error: "User card not found" }, { status: 404 });
    }

    const formData = await req.formData();

    let links;
    let leadForm;
    try {
      links = parseJsonField(
        getStringField(formData, "links"),
        "links",
      );
      const leadFormRaw = formData.get("leadForm");
      if (typeof leadFormRaw === "string") {
        if (leadFormRaw === "__null__" || leadFormRaw.trim() === "") {
          leadForm = null;
        } else {
          leadForm = parseJsonField(leadFormRaw, "leadForm");
        }
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid JSON" },
        { status: 400 },
      );
    }

    const emailToRaw = getStringField(formData, "emailData.to");
    const emailData = {
      to: emailToRaw ? emailToRaw.split(",").map((e) => e.trim()).filter(Boolean) : undefined,
      subject: getStringField(formData, "emailData.subject"),
      message: getStringField(formData, "emailData.message"),
      sendAfterHour: getStringField(formData, "emailData.sendAfterHour"),
      sendAfterMinute: getStringField(formData, "emailData.sendAfterMinute"),
      isActive: getBooleanField(formData, "emailData.isActive"),
    };

    const validation = AdminUserCardUpdateSchema.safeParse({
      cardName: getStringField(formData, "cardName"),
      cardLayout: getStringField(formData, "cardLayout"),
      name: getStringField(formData, "name"),
      location: getNullableStringField(formData, "location"),
      jobTitle: getNullableStringField(formData, "jobTitle"),
      call: getNullableStringField(formData, "call"),
      email: getStringField(formData, "email"),
      company: getNullableStringField(formData, "company"),
      bio: getNullableStringField(formData, "bio"),
      cardTheme: getStringField(formData, "cardTheme"),
      linkColor: getStringField(formData, "linkColor"),
      matchLinkIconsToTheme: getBooleanField(formData, "matchLinkIconsToTheme"),
      font: getStringField(formData, "font"),
      profilePicture: getStringField(formData, "profilePicture"),
      coverPhoto: getStringField(formData, "coverPhoto"),
      companyLogo: getStringField(formData, "companyLogo"),
      qrCodeUrl: getStringField(formData, "qrCodeUrl"),
      links,
      leadForm,
      emailData: Object.values(emailData).some((v) => v !== undefined)
        ? emailData
        : undefined,
      teamTemplateId: getStringField(formData, "teamTemplateId"),
      teamTemplateName: getStringField(formData, "teamTemplateName"),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 },
      );
    }

    const data = validation.data;

    const fileMap = {
      profilePicture: formData.get("profilePictureFile"),
      coverPhoto: formData.get("coverPhotoFile"),
      companyLogo: formData.get("companyLogoFile"),
    };

    for (const [key, file] of Object.entries(fileMap)) {
      if (file instanceof File && file.size > 0) {
        const url = await saveFile(file, userId, { userCard: userCard.id }, "webp");
        userCard[key] = url;
      }
    }

    const scalarFields = [
      "cardName",
      "cardLayout",
      "name",
      "location",
      "jobTitle",
      "call",
      "email",
      "company",
      "bio",
      "cardTheme",
      "linkColor",
      "matchLinkIconsToTheme",
      "font",
      "qrCodeUrl",
    ] as const;

    for (const field of scalarFields) {
      if (data[field] !== undefined) {
        userCard[field] = data[field];
      }
    }

    const imageUrlFields = ["profilePicture", "coverPhoto", "companyLogo"] as const;
    for (const field of imageUrlFields) {
      if (data[field] !== undefined && !(fileMap[field] instanceof File && (fileMap[field] as File).size > 0)) {
        userCard[field] = data[field];
      }
    }

    if (data.links !== undefined) userCard.links = data.links;
    if (data.leadForm !== undefined) userCard.leadForm = data.leadForm;

    if (data.emailData) {
      userCard.emailData = {
        to: data.emailData.to ?? userCard.emailData?.to ?? [],
        subject: data.emailData.subject ?? userCard.emailData?.subject ?? "",
        message: data.emailData.message ?? userCard.emailData?.message ?? "",
        sendAfterHour:
          data.emailData.sendAfterHour ?? userCard.emailData?.sendAfterHour ?? "",
        sendAfterMinute:
          data.emailData.sendAfterMinute ?? userCard.emailData?.sendAfterMinute ?? "",
        isActive:
          data.emailData.isActive ?? userCard.emailData?.isActive ?? false,
      };
    }

    if (data.teamTemplateId !== undefined || data.teamTemplateName !== undefined) {
      if (!userCard.teamTemplate) {
        userCard.teamTemplate = { templateId: undefined, templateName: undefined };
      }
      if (data.teamTemplateId !== undefined) {
        userCard.teamTemplate.templateId = data.teamTemplateId || undefined;
      }
      if (data.teamTemplateName !== undefined) {
        userCard.teamTemplate.templateName = data.teamTemplateName;
      }
    }

    await userCard.save();
    await syncUserCardMapping(userId, userCard);

    const updated = await UserCard.findById(cardId).lean();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin update user card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
