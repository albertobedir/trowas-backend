import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import DigitCode from "@/schemas/mongoose/DigitCode";
import { generateAndHashCode } from "@/utils/generate-digit-code";
import nodemailer from "nodemailer";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";

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

export async function GET(req: Request) {
  try {
    await dbConnect();

    const userId = await getUserIdFromToken(req);
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 200 }
      );
    }

    const { expiresAt, hashedCode, code } = await generateAndHashCode();

    await DigitCode.findOneAndUpdate(
      { email: user.email, type: "email" },
      {
        code_hash: hashedCode,
        expiresAt,
        type: "email",
      },
      { upsert: true, new: true }
    );

    const verificationLink = `https://yourdomain.com/verify-email?code=${code}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          /* Stil kodu buraya eklenmiştir */
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
            <p>Hi ${user.name},</p>
          </div>

          <div class="content">
            <p>Thank you for registering with us! To complete your registration, please verify your email address by using the verification code below.</p>
            <p><strong>Verification Code: ${code}</strong></p>
            <p>Use this code to verify your email address. If you didn't request this, please ignore this email.</p>
          </div>

          <a href="${verificationLink}" class="button">Verify Email</a>

          <div class="footer">
            <p>Best regards, <br>Your Company Name</p>
            <p>If you didn't request this, please disregard this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: "Verify Your Email",
      html: htmlContent,
    };

    smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("E-posta gönderim hatası:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.log(info);
    });

    return NextResponse.json(
      { message: "Verification code sent to your email." },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
