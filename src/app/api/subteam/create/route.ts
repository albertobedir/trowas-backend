"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SubTeam from "@/schemas/mongoose/SubTeam";
import User from "@/schemas/mongoose/User";
import Team from "@/schemas/mongoose/Team";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";
import { saveFile } from "@/utils/upload";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name")?.toString().trim();
    const logoFile = formData.get("logo") as File | null;
    const description = formData.get("description")?.toString().trim();
    const permissions = formData.get("permissions")?.toString().trim();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (permissions === undefined) {
      return NextResponse.json(
        { error: "Permissions are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const team = await Team.findById(user.team);
    if (!team) {
      return NextResponse.json(
        { error: "Parent team not found" },
        { status: 404 }
      );
    }

    let logoUrl = "";
    if (logoFile) {
      logoUrl = await saveFile(logoFile, user._id.toString(), {}, "webp");
    }

    const newSubTeam = await SubTeam.create({
      name,
      owner: user._id,
      parentTeam: team._id,
      members: [user._id],
      permissions,
      description,
      logo: logoUrl,
    });

    if (!user.subTeams) user.subTeams = [];
    user.subTeams.push(newSubTeam._id);

    if (!user.roles.subTeamRole) user.roles.subTeamRole = [];
    user.roles.subTeamRole.push({
      subTeamId: newSubTeam._id,
      role: "owner",
    });

    await user.save();

    return NextResponse.json(
      { message: "SubTeam created successfully", subTeam: newSubTeam },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating subteam:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
