import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

export async function getUserIdFromToken(req: Request): Promise<string | null> {
  // Try Authorization header first (Bearer token)
  const authHeader = req.headers.get("authorization");
  let token: string | undefined;

  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    token = authHeader.slice(7).trim();
  }

  // Fallback to cookie parsing if no bearer token
  if (!token) {
    const cookies = req.headers.get("cookie");
    if (!cookies) return null;

    token = cookies
      .split(";")
      .find((cookie) => cookie.trim().startsWith("access_token="))
      ?.split("=")[1];
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.AT_SECRET!) as JwtPayload;
    const userId = decoded.userId;

    if (!userId) return null;
    return userId;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
