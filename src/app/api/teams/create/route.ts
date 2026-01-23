"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import User from "@/schemas/mongoose/User";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromToken(req);

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.team) {
      return NextResponse.json(
        { error: "User already belongs to a team" },
        { status: 400 }
      );
    }

    const allowedDomain = user.email.split("@")[1] || "";

    const newTeam = await Team.create({
      name: name.trim(),
      owner: userId,
      members: [userId],
      teamSettings: {
        logo: "/babel.png",
        allowedEmailDomain: allowedDomain,
      },
    });

    user.team = newTeam._id;
    user.teams = [...(user.teams || []), newTeam._id];
    user.roles.teamRole = "owner";
    user.permissions.teamPermission = 6;

    await user.save();

    return NextResponse.json(
      { message: "Team created successfully", team: newTeam },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
