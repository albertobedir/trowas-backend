import { NextResponse } from "next/server";

export const setCookie = (
  response: NextResponse,
  name: string,
  value: string,
  maxAge: number
) => {
  response.cookies.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
  });
};
