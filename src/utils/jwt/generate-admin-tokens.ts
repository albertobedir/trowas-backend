"use server";
import jwt from "jsonwebtoken";

const ADMIN_PAYLOAD = { role: "admin" as const };

export const generateAdminTokens = async () => {
  if (!process.env.AT_SECRET || !process.env.RT_SECRET) {
    throw new Error("Please add your JWT secret to .env.local");
  }

  const [admin_access_token, admin_refresh_token] = await Promise.all([
    jwt.sign(ADMIN_PAYLOAD, process.env.AT_SECRET, { expiresIn: "8h" }),
    jwt.sign(ADMIN_PAYLOAD, process.env.RT_SECRET, { expiresIn: "7d" }),
  ]);

  return { admin_access_token, admin_refresh_token };
};
