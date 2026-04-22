import jwt, { JwtPayload } from "jsonwebtoken";

type UserIdPayload = JwtPayload & { userId?: string };

const TOKEN_COOKIE_NAMES = [
  "access_token",
  "accessToken",
  "token",
  "auth_token",
] as const;

/**
 * Normalize token string coming from header/cookie.
 * - decodeURIComponent
 * - strip quotes
 * - strip "Bearer "
 * - strip signed-cookie format: s:<value>.<cookieSig>
 */
function normalizeToken(raw: string): string {
  let v = raw.trim();

  try {
    v = decodeURIComponent(v);
  } catch {
    // ignore
  }

  // Strip wrapping quotes
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
    v = v.slice(1, -1);
  }

  // Strip Bearer prefix
  if (v.toLowerCase().startsWith("bearer ")) {
    v = v.slice(7).trim();
  }

  // Strip signed cookie prefix "s:" and its trailing cookie signature (cookie-parser style)
  // Example: s:<jwt>.<cookieSig>
  if (v.startsWith("s:")) {
    v = v.slice(2);
    const lastDot = v.lastIndexOf(".");
    if (lastDot !== -1) v = v.slice(0, lastDot);
  }

  return v;
}

/** Extract token from Authorization header or Cookie header */
function extractTokenFromRequest(req: Request): string | null {
  console.log("VERIFY AT_SECRET len:", process.env.AT_SECRET?.length);

  // 1) Authorization header (mobile / api clients)
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = normalizeToken(authHeader);
    return token || null;
  }

  // 2) Cookies (web / browser / postman cookie)
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  // Parse cookie header: "a=b; c=d"
  const parts = cookieHeader.split(";").map((c) => c.trim());

  // Try common cookie names
  for (const name of TOKEN_COOKIE_NAMES) {
    const found = parts.find((p) => p.startsWith(name + "="));
    if (found) {
      const rawValue = found.slice(name.length + 1);
      const token = normalizeToken(rawValue);
      return token || null;
    }
  }

  // Fallback: authorization cookie (rare)
  const authCookie = parts.find((p) =>
    p.toLowerCase().startsWith("authorization="),
  );
  if (authCookie) {
    const rawValue = authCookie.split("=").slice(1).join("=");
    const token = normalizeToken(rawValue);
    return token || null;
  }

  return null;
}

/**
 * Main helper: verifies token and returns userId.
 * - Uses AT_SECRET
 * - Logs minimal safe info on failure
 */
export async function getUserIdFromToken(req: Request): Promise<string | null> {
  const token = extractTokenFromRequest(req);
  if (!token) return null;

  const secret = process.env.AT_SECRET;
  if (!secret) {
    console.error("AT_SECRET is not set");
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as UserIdPayload;

    if (!decoded || typeof decoded !== "object") return null;

    const userId = decoded.userId;
    if (!userId || typeof userId !== "string") return null;

    return userId;
  } catch (err) {
    // minimal safe logging
    const preview =
      token.length > 12 ? `${token.slice(0, 8)}...${token.slice(-4)}` : token;

    // Helpful hint: if token contains too many dots, it's likely "signed cookie" not stripped correctly
    const dotCount = (token.match(/\./g) || []).length;

    console.error(
      "JWT verification failed",
      { preview, dotCount },
      "error:",
      err,
    );
    return null;
  }
}
