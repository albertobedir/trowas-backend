"use server";

import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import SubTeam from "@/schemas/mongoose/SubTeam";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/admin/require-admin";
import { AdminSubTeamUpdateSchema } from "@/schemas/zod/admin/team";
import { saveFile } from "@/utils/upload";
import { buildAdminSubteamResponse } from "@/lib/admin/subteam-response";

type RouteContext = { params: Promise<{ subTeamId: string }> };

function getStringField(formData: FormData, key: string): string | undefined {
  const val = formData.get(key);
  return typeof val === "string" && val.trim() !== "" ? val : undefined;
}

export async function GET(req: Request, { params }: RouteContext) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { subTeamId } = await params;
    if (!isValidObjectId(subTeamId)) {
      return NextResponse.json(
        { error: "Invalid sub-team ID" },
        { status: 400 },
      );
    }

    await dbConnect();
    const response = await buildAdminSubteamResponse(subTeamId);

    if (!response) {
      return NextResponse.json(
        { error: "Sub-team not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin get subteam error:", error);
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
    const { subTeamId } = await params;
    if (!isValidObjectId(subTeamId)) {
      return NextResponse.json(
        { error: "Invalid sub-team ID" },
        { status: 400 },
      );
    }

    await dbConnect();

    const subteam = await SubTeam.findById(subTeamId);
    if (!subteam) {
      return NextResponse.json(
        { error: "Sub-team not found" },
        { status: 404 },
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let validation;
    let logoFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("logoFile");
      if (file instanceof File && file.size > 0) logoFile = file;

      validation = AdminSubTeamUpdateSchema.safeParse({
        name: getStringField(formData, "name"),
        description: getStringField(formData, "description"),
        logo: getStringField(formData, "logo"),
        permissions: getStringField(formData, "permissions"),
      });
    } else {
      validation = AdminSubTeamUpdateSchema.safeParse(await req.json());
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
    if (data.description !== undefined)
      updatePayload.description = data.description;
    if (data.permissions !== undefined)
      updatePayload.permissions = data.permissions;

    if (logoFile) {
      updatePayload.logo = await saveFile(
        logoFile,
        subteam.owner.toString(),
        { subteam: subTeamId },
        "webp",
      );
    } else if (data.logo !== undefined) {
      updatePayload.logo = data.logo;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    await SubTeam.findByIdAndUpdate(subTeamId, { $set: updatePayload });

    const response = await buildAdminSubteamResponse(subTeamId);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin update subteam error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
