"use server";
import jwt from "jsonwebtoken";

export const generateTokens = async (userId: string) => {
  if (!process.env.AT_SECRET && !process.env.RT_SECRET) {
    throw new Error("Please add your JWT secret to .env.local");
  }

  const [access_token, refresh_token] = await Promise.all([
    jwt.sign({ userId }, process.env.AT_SECRET!, { expiresIn: "15m" }),
    jwt.sign({ userId }, process.env.RT_SECRET!, { expiresIn: "7d" }),
  ]);

  return { access_token, refresh_token };
};
