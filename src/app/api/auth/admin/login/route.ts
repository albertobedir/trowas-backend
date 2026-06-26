"use server";
import { NextResponse } from "next/server";
import { AdminLoginSchema } from "@/schemas/zod/admin";
import { validateAdminCredentials } from "@/lib/admin/config";
import { generateAdminTokens } from "@/utils/jwt/generate-admin-tokens";
import { setCookie } from "@/utils/cookies";

export async function POST(req: Request) {
  try {
    const validatedFields = AdminLoginSchema.safeParse(await req.json());

    if (!validatedFields.success) {
      const errors = validatedFields.error.format();
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 },
      );
    }

    const { rootNumber, password } = validatedFields.data;

    if (!validateAdminCredentials(rootNumber, password)) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      );
    }

    const { admin_access_token, admin_refresh_token } =
      await generateAdminTokens();

    const response = NextResponse.json(
      { success: true, role: "admin" },
      { status: 200 },
    );

    setCookie(response, "admin_access_token", admin_access_token, 8 * 60 * 60, req);
    setCookie(
      response,
      "admin_refresh_token",
      admin_refresh_token,
      7 * 24 * 60 * 60,
      req,
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
}
