"use server";

import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import Team from "@/schemas/mongoose/Team";
import User from "@/schemas/mongoose/User";
import SubTeam from "@/schemas/mongoose/SubTeam";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/admin/require-admin";
import { AdminTeamDetailLean } from "@/lib/admin/mongoose-lean-types";
import { AdminTeamUpdateSchema } from "@/schemas/zod/admin/team";
import { saveFile } from "@/utils/upload";

type RouteContext = { params: Promise<{ teamId: string }> };

function getStringField(formData: FormData, key: string): string | undefined {
  const val = formData.get(key);
  return typeof val === "string" && val.trim() !== "" ? val : undefined;
}

function getBooleanField(formData: FormData, key: string): boolean | undefined {
  const val = formData.get(key);
  if (val === "true") return true;
  if (val === "false") return false;
  return undefined;
}

export async function GET(req: Request, { params }: RouteContext) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { teamId } = await params;
    if (!isValidObjectId(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    await dbConnect();

    const team = await Team.findById(teamId)
      .populate("owner", "name email profileImage username")
      .lean<AdminTeamDetailLean>();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const [members, pendingUsers, subteams] = await Promise.all([
      User.find({ team: teamId })
        .select("name email username profileImage roles.teamRole createdAt")
        .sort({ name: 1 })
        .lean(),
      team.pendingUsers?.length
        ? User.find({ _id: { $in: team.pendingUsers } })
            .select("name email username profileImage roles.teamRole")
            .lean()
        : Promise.resolve([]),
      SubTeam.find({ parentTeam: teamId })
        .populate("owner", "name email profileImage")
        .select("name description logo members permissions createdAt owner")
        .sort({ name: 1 })
        .lean(),
    ]);

    const subteamsWithCounts = await Promise.all(
      subteams.map(async (st) => ({
        ...st,
        memberCount: st.members?.length ?? 0,
      })),
    );

    return NextResponse.json({
      ...team,
      members,
      pendingUsers,
      subteams: subteamsWithCounts,
      memberCount: members.length,
      subteamCount: subteams.length,
    });
  } catch (error) {
    console.error("Admin get team error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { teamId } = await params;
    if (!isValidObjectId(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    await dbConnect();

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";
    let validation;
    let logoFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("logoFile");
      if (file instanceof File && file.size > 0) logoFile = file;

      validation = AdminTeamUpdateSchema.safeParse({
        name: getStringField(formData, "name"),
        logo: getStringField(formData, "logo"),
        customSubdomain: getStringField(formData, "customSubdomain"),
        allowedEmailDomain: getStringField(formData, "allowedEmailDomain"),
        isRemoveTrowasBranding: getBooleanField(
          formData,
          "isRemoveTrowasBranding",
        ),
        isEnforceSSOLogin: getBooleanField(formData, "isEnforceSSOLogin"),
        isAutoAddEmailDomain: getBooleanField(formData, "isAutoAddEmailDomain"),
        pipelineGenerated: getStringField(formData, "pipelineGenerated"),
        leadsCaptured: getStringField(formData, "leadsCaptured"),
      });
    } else {
      validation = AdminTeamUpdateSchema.safeParse(await req.json());
    }

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 },
      );
    }

    const data = validation.data;
    const updatePayload: Record<string, unknown> = {};

    if (data.name !== undefined) updatePayload.name = data.name;

    if (
      data.logo !== undefined ||
      logoFile ||
      data.customSubdomain !== undefined ||
      data.isRemoveTrowasBranding !== undefined ||
      data.isEnforceSSOLogin !== undefined ||
      data.isAutoAddEmailDomain !== undefined ||
      data.allowedEmailDomain !== undefined
    ) {
      if (!team.teamSettings) team.teamSettings = {} as typeof team.teamSettings;

      if (logoFile) {
        team.teamSettings.logo = await saveFile(
          logoFile,
          team.owner.toString(),
          { team: teamId },
          "webp",
        );
      } else if (data.logo !== undefined) {
        team.teamSettings.logo = data.logo;
      }
      if (data.customSubdomain !== undefined) {
        if (data.customSubdomain) {
          const existing = await Team.findOne({
            "teamSettings.customSubdomain": data.customSubdomain,
            _id: { $ne: teamId },
          });
          if (existing) {
            return NextResponse.json(
              { error: "Custom subdomain is already in use" },
              { status: 400 },
            );
          }
        }
        team.teamSettings.customSubdomain = data.customSubdomain;
      }
      if (data.isRemoveTrowasBranding !== undefined) {
        team.teamSettings.isRemoveTrowasBranding = data.isRemoveTrowasBranding;
      }
      if (data.isEnforceSSOLogin !== undefined) {
        team.teamSettings.isEnforceSSOLogin = data.isEnforceSSOLogin;
      }
      if (data.isAutoAddEmailDomain !== undefined) {
        team.teamSettings.isAutoAddEmailDomain = data.isAutoAddEmailDomain;
      }
      if (data.allowedEmailDomain !== undefined) {
        team.teamSettings.allowedEmailDomain = data.allowedEmailDomain;
      }
      updatePayload.teamSettings = team.teamSettings;
    }

    if (
      data.pipelineGenerated !== undefined ||
      data.leadsCaptured !== undefined
    ) {
      if (!team.teamPerformance) {
        team.teamPerformance = {} as typeof team.teamPerformance;
      }
      if (data.pipelineGenerated !== undefined) {
        team.teamPerformance.pipelineGenerated = data.pipelineGenerated;
      }
      if (data.leadsCaptured !== undefined) {
        team.teamPerformance.leadsCaptured = data.leadsCaptured;
      }
      updatePayload.teamPerformance = team.teamPerformance;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    const updated = await Team.findByIdAndUpdate(
      teamId,
      { $set: updatePayload },
      { new: true },
    )
      .populate("owner", "name email profileImage username")
      .lean<AdminTeamDetailLean>();

    const [members, pendingUsers, subteams] = await Promise.all([
      User.find({ team: teamId })
        .select("name email username profileImage roles.teamRole createdAt")
        .lean(),
      updated?.pendingUsers?.length
        ? User.find({ _id: { $in: updated.pendingUsers } })
            .select("name email username profileImage roles.teamRole")
            .lean()
        : Promise.resolve([]),
      SubTeam.find({ parentTeam: teamId })
        .populate("owner", "name email profileImage")
        .lean(),
    ]);

    const subteamsWithCounts = await Promise.all(
      subteams.map(async (st) => ({
        ...st,
        memberCount: st.members?.length ?? 0,
      })),
    );

    return NextResponse.json({
      ...updated,
      members,
      pendingUsers,
      subteams: subteamsWithCounts,
      memberCount: members.length,
      subteamCount: subteams.length,
    });
  } catch (error) {
    console.error("Admin update team error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
