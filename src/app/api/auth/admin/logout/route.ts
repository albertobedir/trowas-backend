"use server";
import { NextRequest, NextResponse } from "next/server";
import { clearCookie } from "@/utils/cookies";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true }, { status: 200 });

  clearCookie(response, "admin_access_token", req);
  clearCookie(response, "admin_refresh_token", req);

  return response;
}
