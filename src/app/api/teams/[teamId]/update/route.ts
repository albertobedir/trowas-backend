"use server";

import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import { NextResponse } from "next/server";
import { saveFile } from "@/utils/upload";
import { getUserIfTeamRoleAllowed } from "@/utils/decorators/team-role.decorator";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const user = await getUserIfTeamRoleAllowed(req, ["owner", "manager"]);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized or Forbidden" },
        { status: 403 }
      );
    }

    await dbConnect();

    const team = await Team.findById(teamId);
    if (!team || user.team.toString() !== teamId) {
      return NextResponse.json(
        { error: "Team not found or access denied" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const name = formData.get("name")?.toString().trim();
    const logoFile = formData.get("logo") as File | null;

    const updateData: Record<string, any> = {};

    if (name) updateData.name = name;

    if (logoFile) {
      const fileUrl = await saveFile(
        logoFile,
        user._id.toString(),
        { teamId },
        "webp"
      );
      const fullUrl = `${fileUrl}`;
      updateData["teamSettings.logo"] = fullUrl;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid update data provided" },
        { status: 400 }
      );
    }

    await Team.findByIdAndUpdate(teamId, { $set: updateData });

    return NextResponse.json(
      { message: "Team updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Team update error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
