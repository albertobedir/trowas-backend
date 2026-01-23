"use server";

import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import DigitCode from "@/schemas/mongoose/DigitCode";
import { ResetPasswordSchema } from "@/schemas/zod/auth";
import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";

export async function POST(req: Request) {
  try {
    const validatedFields = ResetPasswordSchema.safeParse(await req.json());
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

    const { email, password, confirmPassword, digit_code } =
      validatedFields.data;

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If there's no digit code, check for access token
    if (!digit_code) {
      const userId = await getUserIdFromToken(req);
      if (!userId || userId !== user._id.toString()) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid or missing token" },
          { status: 401 }
        );
      }
    } else {
      // If there is a digit code, validate it
      const userDigitCode = await DigitCode.findOne({ email, type: "password" });
      if (!userDigitCode) {
        return NextResponse.json(
          { error: "No password reset request found for this email" },
          { status: 400 }
        );
      }

      if (userDigitCode.expiresAt < new Date()) {
        await DigitCode.deleteOne({ id: userDigitCode.id });
        return NextResponse.json(
          { error: "Reset code has expired. Please request a new code." },
          { status: 400 }
        );
      }

      const isCodeValid = await compare(digit_code, userDigitCode.code_hash);
      if (!isCodeValid) {
        return NextResponse.json(
          { error: "Invalid reset code. Please check the code and try again." },
          { status: 400 }
        );
      }

      await DigitCode.deleteOne({ email });
    }

    const hashedPassword = await hash(password, 10);
    user.password = hashedPassword;
    user.isChangePass = false;

    await user.save();

    return NextResponse.json(
      { message: "Password has been updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
