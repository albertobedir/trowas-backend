"use server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/schemas/mongoose/User";
import dbConnect from "@/lib/db";
import { LoginSchema } from "@/schemas/zod/auth";
import { generateTokens } from "@/utils/jwt/generate-tokens";
import { setCookie } from "@/utils/cookies";

export async function POST(req: Request) {
  try {
    const validatedFields = LoginSchema.safeParse(await req.json());

    if (!validatedFields.success) {
      const errors = validatedFields.error.format();
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 },
      );
    }

    const { email, password } = validatedFields.data;

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 400 },
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 400 },
      );
    }

    const { access_token, refresh_token } = await generateTokens(
      user._id.toString(),
    );

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    const responseBody = {
      ...userWithoutPassword,
      access_token,
      refresh_token,
    };

    const response = NextResponse.json(responseBody, { status: 200 });

    setCookie(response, "access_token", access_token, 15 * 60, req);
    setCookie(response, "refresh_token", refresh_token, 7 * 24 * 60 * 60, req);

    console.log("LOGIN AT_SECRET len:", process.env.AT_SECRET?.length);

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
}
