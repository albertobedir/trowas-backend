"use server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/schemas/mongoose/User";
import dbConnect from "@/lib/db";
import { RegisterSchema } from "@/schemas/zod/auth";
import { generateTokens } from "@/utils/jwt/generate-tokens";
import { generateUsername } from "@/utils/generate-username";
import { setCookie } from "@/utils/cookies";
import UserCard from "@/schemas/mongoose/UserCard";
import { generateQRCodeBuffer } from "@/utils/generate-qr-code";
import { saveBufferFile } from "@/utils/upload/save-buffer";
import Team from "@/schemas/mongoose/Team";
import { callbackPromise } from "nodemailer/lib/shared";
import { send } from "process";

export async function POST(req: Request) {
  try {
    const validatedFields = RegisterSchema.safeParse(await req.json());

    if (!validatedFields.success) {
      const errors = validatedFields.error.format();
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 },
      );
    }

    const { name, email, password, accountType } = validatedFields.data;

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    const username = await generateUsername(name);

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Geçici kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      username,
      uniqueUrlName: username,
      accountType,
      roles: { userRole: "user" },
    });

    // QR kod oluştur
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

    // Kullanıcı kartı oluştur
    const userCard = await UserCard.create({
      cardName: `${user.name}'s card`,
      user: user._id,
      name: user.name,
      jobTitle: null,
      company: null,
      location: null,
      call: null,
      email: user.email,
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
      emailData: {
        to: [user.email],
        subject: "New lead captured with RollCard",
        message: `Hi ${user.name} and {Lead's First Name},
You both just connected via RollCard and this is an automatic email intro.
{Lead's First Name}, here is ${user.name}'s digital business card.`,
        sendAfterHour: "0",
        sendAfterMinute: "0",
        isActive: false,
      },
    });

    user.userCard = [
      {
        cardId: userCard._id,
        cardName: userCard.cardName,
        cardProfileImage: "/defaultpp.png",
      },
    ];

    if (accountType === "corporate") {
      const newTeam = await Team.create({
        name: `${user.name}'s Team`,
        owner: user._id,
        members: [user._id],
        teamSettings: {
          logo: "/babel.png",
          allowedEmailDomain: user.email.slice(user.email.indexOf("@")),
        },
      });

      user.team = newTeam._id;
      user.subTeams = [];
      user.roles.teamRole = "owner";
      user.permissions.teamPermission = 6;
    }

    await user.save();

    // Token oluştur
    const { access_token, refresh_token } = await generateTokens(
      user._id.toString(),
    );

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    const responseBody = {
      ...userWithoutPassword,
      access_token,
      refresh_token,
    };

    const response = NextResponse.json(responseBody, { status: 201 });

    // Cookie'leri ayarla
    setCookie(response, "access_token", access_token, 15 * 60);
    setCookie(response, "refresh_token", refresh_token, 7 * 24 * 60 * 60);

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 },
    );
  }
}
