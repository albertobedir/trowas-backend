"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CardTemplate from "@/schemas/mongoose/Template";
import User from "@/schemas/mongoose/User";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";
import CardTemplateSchema from "@/schemas/zod/template";
import { saveFile } from "@/utils/upload";

function getStringField(formData: FormData, key: string): string | undefined {
  const val = formData.get(key);
  return typeof val === "string" && val.trim() !== "" ? val : undefined;
}

function getBooleanField(formData: FormData, key: string): boolean | undefined {
  const val = formData.get(key);
  return val === "true" ? true : val === "false" ? false : undefined;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const userId = await getUserIdFromToken(req);
    const { templateId } = await params;

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!templateId || !isValidObjectId(templateId)) {
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

    const formData = await req.formData();

    const rawData: any = {
      templateName: getStringField(formData, "templateName"),
      cardLayout: getStringField(formData, "cardLayout"),
      company: getStringField(formData, "company"),
      location: getStringField(formData, "location"),
      bio: getStringField(formData, "bio"),
      cardTheme: getStringField(formData, "cardTheme"),
      linkColor: getStringField(formData, "linkColor"),
      matchLinkIconsToTheme: getBooleanField(formData, "matchLinkIconsToTheme"),
      font: getStringField(formData, "font"),
      connectButtonLabel: getStringField(formData, "connectButtonLabel"),
      formDisclaimer: getStringField(formData, "formDisclaimer"),
      allowNonAdminsToUse: getBooleanField(formData, "allowNonAdminsToUse"),
    };
    const linksRaw = formData.get("links") as string;
    if (linksRaw) {
      try {
        rawData.links = JSON.parse(linksRaw);
      } catch {
        return NextResponse.json(
          { error: "Invalid 'links' format. Must be valid JSON array." },
          { status: 400 }
        );
      }
    }

    const validation = CardTemplateSchema.safeParse(rawData);
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

    const validatedData = validation.data;

    // Dosya yüklemeleri
    const profilePicture = formData.get("profilePicture") as File | null;
    const coverPhoto = formData.get("coverPhoto") as File | null;
    const companyLogo = formData.get("companyLogo") as File | null;

    if (profilePicture) {
      validatedData.profilePicture = await saveFile(
        profilePicture,
        userId,
        { templateId: templateId },
        "webp"
      );
    }

    if (coverPhoto) {
      validatedData.coverPhoto = await saveFile(
        coverPhoto,
        userId,
        { templateId: templateId },
        "webp"
      );
    }

    if (companyLogo) {
      validatedData.companyLogo = await saveFile(
        companyLogo,
        userId,
        { templateId: templateId },
        "webp"
      );
    }

    const updatedTemplate = await CardTemplate.findByIdAndUpdate(
      templateId,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { message: "Template updated successfully", data: updatedTemplate },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
