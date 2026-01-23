"use server";

import { NextResponse } from "next/server";
import User from "@/schemas/mongoose/User";
import dbConnect from "@/lib/db";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";
import { Resend } from "resend";
import EmailVerificationEmail from "@/components/api/templates/emails/verify-email";
import { generateAndHashCode } from "@/utils/generate-digit-code";
import DigitCode from "@/schemas/mongoose/DigitCode";
import { saveFile } from "@/utils/upload";
import { userUpdateSchema } from "@/schemas/zod/user";

const resend = new Resend(process.env.RESEND_API_KEY!);

function getStringField(formData: FormData, key: string): string | undefined {
  const val = formData.get(key);
  return typeof val === "string" && val.trim() !== "" ? val : undefined;
}

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const userId = await getUserIdFromToken(req);

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();

    const rawData = {
      name: getStringField(formData, "name"),
      email: getStringField(formData, "email"),
      profileImage: getStringField(formData, "profileImage"),
    };

    const validation = userUpdateSchema.safeParse(rawData);

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

    const { name, email } = validation.data;
    const updatePayload: Record<string, any> = {};

    if (name) updatePayload.name = name;

    if (email && email !== user.email) {
      const emailInUse = await User.findOne({ email });
      if (emailInUse) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 400 }
        );
      }

      const { expiresAt, hashedCode, code } = await generateAndHashCode();

      const digitCode = new DigitCode({
        email,
        code_hash: hashedCode,
        expiresAt,
        type: "email",
      });

      user.email = email;
      user.emailVerified = null;
      await user.save();
      await digitCode.save();

      const { error: resendError } = await resend.emails.send({
        from: "no-reply@resend.dev",
        to: email,
        subject: "Verify Your Email",
        react: await EmailVerificationEmail({
          name: user.name,
          verificationCode: code,
        }),
      });

      if (resendError) {
        return NextResponse.json({ error: resendError }, { status: 500 });
      }

      return NextResponse.json(
        {
          message:
            "Your email has been updated. Please verify it using the code we just sent.",
        },
        { status: 200 }
      );
    }

    const profileImageFile = formData.get("profileImageFile") as File | null;
    if (profileImageFile) {
      updatePayload.profileImage = await saveFile(
        profileImageFile,
        userId,
        {},
        "webp"
      );
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatePayload },
      { new: true }
    ).select("-password");

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
