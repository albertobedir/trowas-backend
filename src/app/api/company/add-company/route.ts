"use server";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import UserCard from "@/schemas/mongoose/UserCard";
import Team from "@/schemas/mongoose/Team";
import { generateQRCodeBuffer } from "@/utils/generate-qr-code";
import { saveBufferFile } from "@/utils/upload/save-buffer";
import { generateUsername } from "@/utils/generate-username";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";

export async function POST(req: Request) {
  try {
    const { count } = await req.json();
    const userId = await getUserIdFromToken(req);
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!Number.isInteger(count) || count <= 0) {
      return NextResponse.json({ error: "Invalid count" }, { status: 400 });
    }
    const team = await Team.findOne({ owner: userId });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    await dbConnect();

    const createdUsers = [];

    for (let i = 0; i < count; i++) {
      const name = `Company Page ${i + 1}`;
      const email = `companypage-${Date.now()}-${i}@company.com`;

      const password = await bcrypt.hash("temporary", 10); // geçici dummy şifre

      const username = await generateUsername(name);

      const user = await User.create({
        name,
        email,
        password,
        username,
        uniqueUrlName: username,
        roles: {
          userRole: "user",
          teamRole: "company page", // Özel rol
        },
      });

      const qrBuffer = await generateQRCodeBuffer(
        `https://yourdomain.com/u/${user._id}`,
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
        cardName: `${user.name}'s Company Card`,
        user: user._id,
        name: user.name,
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


      user.team = team._id;
      user.roles.teamRole = "company page";
      user.permissions.teamPermission = 6;
      user.userCard = [
        {
          cardId: userCard._id,
          cardName: userCard.cardName,
          cardProfileImage: "/defaultpp.png",
        },
      ];

      await user.save();

      const userData = user.toObject();
      delete userData.password;
      team.members.push(user._id);
      await team.save();

      createdUsers.push(userData);
    }

    return NextResponse.json({ createdUsers }, { status: 201 });
  } catch (error) {
    console.error("Company Page API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
