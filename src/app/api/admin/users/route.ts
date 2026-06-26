"use server";

import { NextResponse } from "next/server";
import User from "@/schemas/mongoose/User";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/admin/require-admin";
import { AdminUserListQuerySchema } from "@/schemas/zod/admin/user";
import type { FilterQuery } from "mongoose";

export async function GET(req: Request) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query = AdminUserListQuerySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      accountType: searchParams.get("accountType") ?? undefined,
      userRole: searchParams.get("userRole") ?? undefined,
      isVipMember: searchParams.get("isVipMember") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder: searchParams.get("sortOrder") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!query.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: query.error.format() },
        { status: 400 },
      );
    }

    const {
      search,
      accountType,
      userRole,
      isVipMember,
      sortBy,
      sortOrder,
      page,
      limit,
    } = query.data;

    const filter: FilterQuery<typeof User> = {};

    if (search?.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
        { username: { $regex: term, $options: "i" } },
      ];
    }

    if (accountType !== "all") {
      filter.accountType = accountType;
    }

    if (userRole !== "all") {
      filter["roles.userRole"] = userRole;
    }

    if (isVipMember !== "all") {
      filter.isVipMember = isVipMember === "true";
    }

    const sortField =
      sortBy === "accountType" ? "accountType" : sortBy;
    const sort: Record<string, 1 | -1> = {
      [sortField]: sortOrder === "asc" ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select(
          "name email username accountType isVipMember roles.userRole profileImage createdAt uniqueUrlName",
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { RegisterSchema } = await import("@/schemas/zod/auth");
    const bcryptModule = await import("bcryptjs");
    const bcrypt = bcryptModule.default;
    const { generateUsername } = await import("@/utils/generate-username");
    const { generateQRCodeBuffer } = await import("@/utils/generate-qr-code");
    const { saveBufferFile } = await import("@/utils/upload/save-buffer");
    const UserCard = (await import("@/schemas/mongoose/UserCard")).default;
    const Team = (await import("@/schemas/mongoose/Team")).default;

    const validatedFields = RegisterSchema.safeParse(await req.json());

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedFields.error.format() },
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
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      username,
      uniqueUrlName: username,
      accountType,
      roles: { userRole: "user" },
    });

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

    const createdUser = await User.findById(user._id).select("-password").lean();

    return NextResponse.json(
      { message: "User created successfully", user: createdUser },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
