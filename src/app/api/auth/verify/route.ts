"use server";

import dbConnect from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import DigitCode from "@/schemas/mongoose/DigitCode";
import User from "@/schemas/mongoose/User";
import { VerifyDigitCodeSchema } from "@/schemas/zod/auth";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await rateLimit(req);

    const validatedFields = VerifyDigitCodeSchema.safeParse(await req.json());
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

    const { email, digit_code } = validatedFields.data;

    await dbConnect();

    const userDigitCode = await DigitCode.findOne({ email });

    if (!userDigitCode) {
      return NextResponse.json(
        { error: "Digit code not found for this email" },
        { status: 404 }
      );
    }

    if (userDigitCode.expiresAt < new Date()) {
      await DigitCode.deleteOne({ id: userDigitCode.id });
      return NextResponse.json(
        { error: "Digit code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    const code_match = await compare(digit_code, userDigitCode.code_hash);

    if (!code_match) {
      return NextResponse.json(
        { error: "Invalid digit code. Please check the code and try again." },
        { status: 400 }
      );
    }

    if (userDigitCode.type === "email") {
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      user.email_verified = new Date();
      await user.save();
    }

    return NextResponse.json(
      {
        message:
          userDigitCode.type === "email"
            ? "Email verified successfully."
            : "Digit code is valid. You can now reset your password.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
