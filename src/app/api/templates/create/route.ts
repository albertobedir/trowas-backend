"use server";

import dbConnect from "@/lib/db";
import CardTemplate from "@/schemas/mongoose/Template";
import Team from "@/schemas/mongoose/Team";
import User from "@/schemas/mongoose/User";
import CardTemplateSchema from "@/schemas/zod/template";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { saveFile } from "@/utils/upload";
import { generateQRCodeBuffer } from "@/utils/generate-qr-code";

interface SavedFiles {
  profilePicture?: string;
  coverPhoto?: string;
  companyLogo?: string;
}

function getStringField(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function getBooleanField(formData: FormData, key: string): boolean | undefined {
  const value = formData.get(key);
  return value !== null ? value === "true" : undefined;
}

export const POST = async (req: Request) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const session = await User.findById(userId);
    if (!session) {
      return NextResponse.json({ error: "User not Found" }, { status: 404 });
    }

    const team = await Team.findById(session.team);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const formData = await req.formData();

    const profilePicture = formData.get("profilePicture") as File | null;
    const coverPhoto = formData.get("coverPhoto") as File | null;
    const companyLogo = formData.get("companyLogo") as File | null;

    const rawData: any = {
      templateName: getStringField(formData, "templateName"),
      cardLayout: getStringField(formData, "cardLayout"),
      profilePicture: "/defaultpp.png",
      coverPhoto: "/defaultcover.jpg",
      companyLogo: "/defaultcompanylogo.png",
      company: getStringField(formData, "company"),
      location: getStringField(formData, "location"),
      bio: getStringField(formData, "bio"),
      cardTheme: getStringField(formData, "colorTheme"),
      linkColor: getStringField(formData, "linkColor"),
      matchLinkIconsToTheme: getBooleanField(formData, "matchLinkIconsToTheme"),
      font: getStringField(formData, "font"),
      connectButtonLabel: getStringField(formData, "connectButtonLabel"),
      formDisclaimer: getStringField(formData, "formDisclaimer"),
      allowNonAdminsToUse: getBooleanField(formData, "allowNonAdminsToUse"),
      links: [],
      leadForm: null,
    };

    const linksRaw = formData.get("links") as string;
    if (linksRaw) {
      try {
        rawData.links = JSON.parse(linksRaw);
      } catch {
        return NextResponse.json(
          { error: "Invalid 'links' format, must be JSON." },
          { status: 400 }
        );
      }
    }

    const validatedFields = CardTemplateSchema.safeParse({
      permission: session.permissions.subTeamPermission,
      ...rawData,
    });
    if (!validatedFields.success) {
      const errors = validatedFields.error.errors.map((err) => ({
        message: err.message,
        path: err.path.join("."),
      }));
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const cardTemplateData = validatedFields.data;

    const savedFiles: SavedFiles = {};
    if (profilePicture) {
      savedFiles.profilePicture = await saveFile(
        profilePicture,
        userId,
        { templateTeamId: team.id },
        "webp"
      );
    }
    if (coverPhoto) {
      savedFiles.coverPhoto = await saveFile(
        coverPhoto,
        userId,
        { templateTeamId: team.id },
        "webp"
      );
    }
    if (companyLogo) {
      savedFiles.companyLogo = await saveFile(
        companyLogo,
        userId,
        { templateTeamId: team.id },
        "webp"
      );
    }



    const newCardTemplate = await CardTemplate.create({
      ...cardTemplateData,
      team: team.id,
      ...savedFiles,
    });

    await Team.findByIdAndUpdate(
      team.id,
      { $push: { templates: newCardTemplate._id } },
      { new: true }
    );

    return NextResponse.json(
      { message: "Card template created successfully", data: newCardTemplate },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
