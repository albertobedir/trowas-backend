import jwt, { JwtPayload } from "jsonwebtoken";

type AdminPayload = JwtPayload & { role?: string };

const ADMIN_TOKEN_COOKIE_NAMES = [
  "admin_access_token",
  "adminAccessToken",
] as const;

function normalizeToken(raw: string): string {
  let v = raw.trim();

  try {
    v = decodeURIComponent(v);
  } catch {
    // ignore
  }

  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
    v = v.slice(1, -1);
  }

  if (v.toLowerCase().startsWith("bearer ")) {
    v = v.slice(7).trim();
  }

  if (v.startsWith("s:")) {
    v = v.slice(2);
    const lastDot = v.lastIndexOf(".");
    if (lastDot !== -1) v = v.slice(0, lastDot);
  }

  return v;
}

function extractAdminTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = normalizeToken(authHeader);
    return token || null;
  }

  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(";").map((c) => c.trim());

  for (const name of ADMIN_TOKEN_COOKIE_NAMES) {
    const found = parts.find((p) => p.startsWith(name + "="));
    if (found) {
      const rawValue = found.slice(name.length + 1);
      const token = normalizeToken(rawValue);
      return token || null;
    }
  }

  return null;
}

export async function isAdminFromRequest(req: Request): Promise<boolean> {
  const token = extractAdminTokenFromRequest(req);
  if (!token) return false;

  const secret = process.env.AT_SECRET;
  if (!secret) return false;

  try {
    const decoded = jwt.verify(token, secret) as AdminPayload;
    return decoded?.role === "admin";
  } catch {
    return false;
  }
}
