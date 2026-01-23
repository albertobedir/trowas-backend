"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EmailSignature from "@/schemas/mongoose/EmailSignature";
import User from "@/schemas/mongoose/User";
import { isValidObjectId } from "mongoose";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { saveFile } from "@/utils/upload";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const userId = await getUserIdFromToken(req);
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!currentUser.team || !isValidObjectId(currentUser.team)) {
      return NextResponse.json(
        { error: "User is not assigned to a valid team" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    // Düz veri
    const signatureName = formData.get("name")?.toString() || "Untitled";
    const disclaimer = formData.get("disclaimer")?.toString() || "";

    // Boolean gösterim alanları
    const information = {
      name: formData.get("showName") === "true",
      pronouns: formData.get("showPronouns") === "true",
      jobtitle: formData.get("showJobTitle") === "true",
      companyname: formData.get("showCompanyName") === "true",
      location: formData.get("showLocation") === "true",
      email: formData.get("showEmail") === "true",
      phoneNumber: formData.get("showPhoneNumber") === "true",
    };

    const images = {
      profilepic: formData.get("showProfilePic") === "true",
      companylogo: formData.get("showCompanyLogo") === "true",
      qrcode: formData.get("showQRCode") === "true",
      banner: "", // eğer varsa aşağıda dosya olarak kaydedilecek
    };

    // Banner görseli dosya olarak geldi mi?
    const bannerFile = formData.get("bannerImage") as File | null;
    if (bannerFile && bannerFile.size > 0) {
      const url = await saveFile(bannerFile, userId, {}, "webp");
      images.banner = url;
    }

    const newSignature = new EmailSignature({
      signatureName,
      information,
      images,
      disclaimer,
      users: [], // ek kullanıcı seçimi yapılmamışsa boş
      team: currentUser.team,
    });

    await newSignature.save();

    return NextResponse.json(
      { message: "EmailSignature created successfully", data: newSignature },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating EmailSignature:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
