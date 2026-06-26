import { NextResponse } from "next/server";

function shouldUseSecureCookies(request?: Request): boolean {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;

  const forwardedProto = request?.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  return process.env.NODE_ENV === "production";
}

export const setCookie = (
  response: NextResponse,
  name: string,
  value: string,
  maxAge: number,
  request?: Request,
) => {
  response.cookies.set(name, value, {
    httpOnly: true,
    secure: shouldUseSecureCookies(request),
    sameSite: "lax",
    path: "/",
    maxAge,
    ...(process.env.COOKIE_DOMAIN
      ? { domain: process.env.COOKIE_DOMAIN }
      : {}),
  });
};

export const clearCookie = (
  response: NextResponse,
  name: string,
  request?: Request,
) => {
  setCookie(response, name, "", 0, request);
};
