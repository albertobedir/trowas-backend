import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { generateTokens } from "@/utils/jwt/generate-tokens";
import { setCookie } from "@/utils/cookies";

export async function GET(req: NextRequest) {
  try {
    // Accept refresh token from cookie OR Authorization: Bearer <token>
    const cookieToken = req.cookies.get("refresh_token")?.value;
    const authHeader = req.headers.get("authorization");
    let refreshToken: string | undefined = undefined;

    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      refreshToken = authHeader.slice(7).trim();
    }

    if (!refreshToken) refreshToken = cookieToken;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 },
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.RT_SECRET!);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 },
      );
    }

    if (typeof decoded !== "object" || !decoded.userId) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 },
      );
    }

    const userId = decoded.userId;

    const { access_token, refresh_token } = await generateTokens(userId);

    const response = NextResponse.json(
      { message: "Tokens refreshed successfully" },
      { status: 200 },
    );

    setCookie(response, "access_token", access_token, 15 * 60, req);
    setCookie(response, "refresh_token", refresh_token, 7 * 24 * 60 * 60, req);

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
