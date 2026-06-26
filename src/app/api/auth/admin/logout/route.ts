"use server";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });

  response.cookies.set("admin_access_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  });

  response.cookies.set("admin_refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  });

  return response;
}
