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

const smtpTransport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT!, 10),
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

function generateRandomPassword(length = 12) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    await dbConnect();

    const { emails } = await req.json();
    const { teamId } = await params;

    const actor = await getUserIfTeamRoleAllowed(req, ["owner", "manager"]);

    if (!actor || !isValidObjectId(actor._id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!emails?.length || !teamId) {
      return NextResponse.json(
        { error: "Emails and teamId are required" },
        { status: 400 },
      );
    }

    const team = await Team.findById(teamId);

    if (!team || actor.team?.toString() !== teamId) {
      return NextResponse.json(
        { error: "Team not found or access denied" },
        { status: 403 },
      );
    }

    const success: string[] = [];
    const errors: string[] = [];

    for (const email of emails) {
      try {
        let user = await User.findOne({ email });
        let isNewUser = false;
        let tempPassword = "";

        /**
         * =========================
         * 1. USER YOKSA CREATE
         * =========================
         */
        if (!user) {
          isNewUser = true;

          const name = email.split("@")[0];
          const username = await generateUsername(name);
          tempPassword = generateRandomPassword();

          const hashedPassword = await bcrypt.hash(tempPassword, 10);

          user = await User.create({
            name,
            email,
            username,
            uniqueUrlName: username,
            password: hashedPassword,

            // 🔥 CRITICAL FIX: assign correct team immediately
            team: team._id,

            roles: {
              userRole: "user",
              teamRole: "member",
            },

            permissions: {
              teamPermission: 0,
            },

            isChangePass: true,
          });

          // create default card
          const qrBuffer = await generateQRCodeBuffer(
            `${process.env.BASE_URL}connect/${user._id}`,
            "svg",
          );

          const qrCodePath = await saveBufferFile(
            qrBuffer,
            user._id,
            {},
            "svg",
            "qrCodes",
          );

          const card = await UserCard.create({
            user: user._id,
            cardName: `${name}'s card`,
            name,

            profilePicture: "/defaultpp.png",
            coverPhoto: "/defaultcover.jpg",
            companyLogo: "/defaultcompanylogo.png",

            qrCodeUrl: qrCodePath,

            links: [],
          });

          user.userCard = [
            {
              cardId: card._id,
              cardName: card.cardName,
              cardProfileImage: "/defaultpp.png",
            },
          ];

          await user.save();
        }

        /**
         * =========================
         * 2. USER VARSA TEAM TRANSFER FIX
         * =========================
         */
        const oldTeamId = user.team?.toString();

        if (oldTeamId && oldTeamId !== teamId) {
          // remove from old team
          await Team.updateOne(
            { _id: oldTeamId },
            { $pull: { members: user._id } },
          );
        }

        /**
         * =========================
         * 3. ASSIGN NEW TEAM (SOURCE OF TRUTH FIX)
         * =========================
         */
        user.team = team._id;
        user.roles.teamRole = "member";

        await user.save();

        /**
         * =========================
         * 4. ADD TO NEW TEAM
         * =========================
         */
        await Team.updateOne(
          { _id: team._id },
          { $addToSet: { members: user._id } },
        );

        /**
         * =========================
         * 5. SEND EMAIL
         * =========================
         */
        const html = `
        <div>
          <h2>Hello ${user.name}</h2>
          <p>You’ve been added to <b>${team.name}</b></p>
          ${
            isNewUser ? `<p>Temporary password: <b>${tempPassword}</b></p>` : ""
          }
          <a href="${process.env.BASE_URL}">Login</a>
        </div>
        `;

        await smtpTransport.sendMail({
          from: process.env.MAIL_USERNAME,
          to: user.email,
          subject: isNewUser ? "Account created & invited" : "Team invitation",
          html,
        });

        success.push(email);
      } catch (err) {
        console.error(err);
        errors.push(email);
      }
    }

    return NextResponse.json({
      message: "Done",
      success,
      errors,
    });
  } catch (err) {
    console.error("ADD MEMBER ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
