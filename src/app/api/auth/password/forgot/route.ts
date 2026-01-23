"use server";

import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import DigitCode from "@/schemas/mongoose/DigitCode";
import { ForgotPasswordSchema } from "@/schemas/zod/auth";
import { NextResponse } from "next/server";
import { generateAndHashCode } from "@/utils/generate-digit-code";
import { rateLimit } from "@/lib/rateLimit";
import nodemailer from "nodemailer";

const smtpTransport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT!, 10),
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  logger: true,
  debug: true,
});

export async function POST(req: Request) {
  try {
    await rateLimit(req);

    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const errorDetails = parsed.error.errors.map((err) => ({
        message: err.message,
        path: err.path.join("."),
      }));
      return jsonError("Validation failed", 400, { details: errorDetails });
    }

    const { email } = parsed.data;
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) return jsonError("User not found", 404);

    const existing = await DigitCode.findOne({ email });

    if (existing && existing.expiresAt > new Date()) {
      return jsonError(
        "You already have a valid digit code. Please wait until it expires.",
        400
      );
    }

    if (existing && existing.expiresAt <= new Date()) {
      await DigitCode.deleteOne({ email });
    }

    const { code, hashedCode, expiresAt } = await generateAndHashCode();

    await new DigitCode({
      email,
      code_hash: hashedCode,
      expiresAt,
      type: "password",
    }).save();

    const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
          color: #333;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          max-width: 500px;
          margin: 0 auto;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .code {
          font-size: 24px;
          font-weight: bold;
          background: #f0f0f0;
          padding: 10px 20px;
          border-radius: 6px;
          display: inline-block;
          margin-top: 10px;
          letter-spacing: 2px;
        }
        .footer {
          font-size: 12px;
          color: #888;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Hi ${user.name},</h2>
        <p>You requested to reset your password.</p>
        <p>Use the code below to reset it:</p>
        <div class="code">${code}</div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, you can ignore this email.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Your App Name
        </div>
      </div>
    </body>
  </html>
`;

    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: "Verify Your Email",
      html,
    };

    smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("E-posta gönderim hatası:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.log(info);
    });

    return NextResponse.json(
      { message: "Password reset code sent to your email." },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return jsonError(message, 500);
  }
}

function jsonError(
  message: string,
  status: number = 500,
  extra: Record<string, any> = {}
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}
