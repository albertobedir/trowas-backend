"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CardTemplate from "@/schemas/mongoose/Template";
import Team from "@/schemas/mongoose/Team";
import User from "@/schemas/mongoose/User"; // Burada User kullanıyoruz
import { isValidObjectId, Types } from "mongoose";
import { getUserIfTeamRoleAllowed } from "@/utils/decorators/team-role.decorator";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";

interface IUserLean {
  templates: Types.ObjectId[]; // User.templates dizisi objectId olmalı
}

export async function GET(req: Request) {
  try {
    const sessionId = await getUserIdFromToken(req);
    if (!sessionId || !isValidObjectId(sessionId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");

    if (!teamId || !isValidObjectId(teamId)) {
      return NextResponse.json(
        { error: "Invalid or missing team ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const teamExists = await Team.exists({ _id: teamId });
    if (!teamExists) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const privilegedUser = await getUserIfTeamRoleAllowed(req, [
      "owner",
      "manager",
    ]);

    let templates;

    if (privilegedUser) {
      // Yetkili kullanıcı tüm team şablonlarını alır
      templates = await CardTemplate.find({ team: teamId });
    } else {
      // Yetkisiz kullanıcı sadece kendisine atanmış template'leri User modelinden alıyoruz
      const user = await User.findById(sessionId).lean<IUserLean>();

      if (!user) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      templates = await CardTemplate.find({
        _id: { $in: user.templates },
        team: teamId,
      });
    }

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
