"use server";

import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import User from "@/schemas/mongoose/User";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getUserIfTeamRoleAllowed } from "@/utils/decorators/team-role.decorator";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { generateUsername } from "@/utils/generate-username";
import UserCard from "@/schemas/mongoose/UserCard";
import { generateQRCodeBuffer } from "@/utils/generate-qr-code";
import { saveBufferFile } from "@/utils/upload/save-buffer";
import { transformValue } from "framer-motion";

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

function generateRandomPassword(length = 12) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    await dbConnect();

    const { emails } = await req.json();
    const { teamId } = await params;
    const user = await getUserIfTeamRoleAllowed(req, ["owner", "manager"]);

    if (!user || !isValidObjectId(user._id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!emails || !emails.length || !teamId) {
      return NextResponse.json(
        { error: "Emails and teamId are required" },
        { status: 400 }
      );
    }

    const team = await Team.findById(teamId);
    if (!team || user.team?.toString() !== teamId) {
      return NextResponse.json(
        { error: "Team not found or access denied" },
        { status: 403 }
      );
    }

    const errors: string[] = [];
    const success: string[] = [];

    for (const email of emails) {
      let invitedUser = await User.findOne({ email });
      let isNewUser = false;
      let generatedPassword = "";

      // Kullanıcı sistemde yoksa oluştur
      if (!invitedUser) {
        isNewUser = true;
        const name = email.split("@")[0];
        const username = await generateUsername(name);
        generatedPassword = generateRandomPassword();

        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        invitedUser = await User.create({
          name,
          email,
          password: hashedPassword,
          username,
          uniqueUrlName: username,
          team: team._id,
          roles: { userRole: "user", teamRole: "member" },
          permissions: { teamPermission: 0 },
          isChangePass: true,
        });
        const qrBuffer = await generateQRCodeBuffer(
          `${process.env.BASE_URL}connect/${user._id}`,
          "svg"
        );

        const qrCodePath = await saveBufferFile(
          qrBuffer,
          user._id,
          {},
          "svg",
          "qrCodes"
        );
        const userCard = await UserCard.create({
          cardName: `${name}'s card`,
          user: invitedUser._id,
          name: name,
          jobTitle: null,
          company: null,
          location: null,
          bio: null,
          font: "Baskerville",
          linkColor: "#000000",
          cardColor: "#ffffff",
          matchLinkIconsToTheme: false,
          profilePicture: "/defaultpp.png",
          coverPhoto: "/defaultcover.jpg",
          companyLogo: "/defaultcompanylogo.png",
          qrCodeUrl: `${qrCodePath}`,
          links: [],
        });
        invitedUser.userCard = [
          {
            cardId: userCard._id,
            cardName: userCard.cardName,
            cardProfileImage: "/defaultpp.png",
          },
        ];

        await invitedUser.save();
      }

      // E-posta HTML içeriği
      const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 50px auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .email-header {
      font-size: 24px;
      color: #4f46e5;
    }
    .email-body {
      margin-top: 20px;
      font-size: 16px;
      color: #555;
    }
    .btn {
      margin-top: 20px;
      display: inline-block;
      background-color: #4f46e5;
      color: white;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
    .email-footer {
      margin-top: 30px;
      font-size: 14px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">Hello ${invitedUser.name},</div>
    <div class="email-body">
      <p>You’ve been added to the team <strong>${team.name}</strong>.</p>
      ${
        isNewUser
          ? `<p>Your temporary password is: <strong>${generatedPassword}</strong></p>`
          : ""
      }
      <p>Please click the button below to access your team:</p>
      <a class="btn" href="${process.env.BASE_URL}">Login to RollCard</a>
    </div>
    <div class="email-footer">
      If you did not expect this invitation, you can ignore this email.
    </div>
  </div>
</body>
</html>`;

      try {
        const mailOptions = {
          from: process.env.MAIL_USERNAME,
          to: invitedUser.email,
          subject: isNewUser
            ? "You're invited - Your account has been created"
            : "You've been added to a team",
          html,
        };

        await smtpTransport.sendMail(mailOptions);

        // Kullanıcı zaten team.members içinde değilse ekle
        if (!team.members.includes(invitedUser._id)) {
          team.members.push(invitedUser._id);
          await team.save();
        }

        success.push(`User added and email sent to ${email}`);
      } catch (mailErr) {
        console.error(mailErr);
        errors.push(`Failed to send email to ${email}`);
      }
    }

    if (errors.length) {
      return NextResponse.json({ error: errors, success }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "Users successfully added to the team.",
        success,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding users to team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
