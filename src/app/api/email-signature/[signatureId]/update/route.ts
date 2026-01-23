"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EmailSignature from "@/schemas/mongoose/EmailSignature";
import User from "@/schemas/mongoose/User";
import { isValidObjectId } from "mongoose";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { saveFile } from "@/utils/upload";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ signatureId: string }> }
) {
  try {
    await dbConnect();

    const userId = await getUserIdFromToken(req);
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { signatureId } = await params;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const signature = await EmailSignature.findById(signatureId);
    console.log(signatureId);
    if (!signature) {
      return NextResponse.json(
        { error: "EmailSignature not found" },
        { status: 404 }
      );
    }

    if (
      !currentUser.team ||
      signature.team.toString() !== currentUser.team.toString()
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (currentUser.roles.teamRole !== "owner" && currentUser.roles.teamRole !== "manager") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    // name alanı (signature adı)
    const signatureName = formData.get("name")?.toString() || "";
    if (signatureName.trim()) {
      signature.signatureName = signatureName.trim();
    }

    // information
    signature.information.name = formData.get("showName") === "true";
    signature.information.pronouns =
      formData.get("showPronouns") === "false" ? false : true;
    signature.information.jobtitle = formData.get("showJobTitle") === "true";
    signature.information.companyname =
      formData.get("showCompanyName") === "true";
    signature.information.location = formData.get("showLocation") === "true";
    signature.information.email = formData.get("showEmail") === "true";
    signature.information.phoneNumber =
      formData.get("showPhoneNumber") === "true";

    signature.images.profilepic = formData.get("showProfilePic") === "true";
    signature.images.companylogo = formData.get("showCompanyLogo") === "true";
    signature.images.qrcode = formData.get("showQRCode") === "true";

    const bannerFile = formData.get("bannerImage") as File | null;
    if (bannerFile && bannerFile.size > 0) {
      const url = await saveFile(bannerFile, userId, {}, "webp");
      signature.images.banner = url;
    }

    const disclaimer = formData.get("disclaimer")?.toString();
    if (disclaimer !== undefined) {
      signature.disclaimer = disclaimer;
    }

    await signature.save();

    return NextResponse.json(
      { message: "EmailSignature updated successfully", data: signature },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating EmailSignature:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
