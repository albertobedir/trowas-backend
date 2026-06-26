"use server";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";
import User from "@/schemas/mongoose/User";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/admin/require-admin";
import { AdminUserUpdateSchema } from "@/schemas/zod/admin/user";
import { saveFile } from "@/utils/upload";

type RouteContext = { params: Promise<{ userId: string }> };

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
    const { userId } = await params;

    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId)
      .select("-password")
      .populate("team", "name")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Admin get user error:", error);
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
    const { userId } = await params;

    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const contentType = req.headers.get("content-type") || "";
    let validation;
    let profileImageFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("profileImageFile");

      if (file instanceof File && file.size > 0) {
        profileImageFile = file;
      }

      validation = AdminUserUpdateSchema.safeParse({
        name: getStringField(formData, "name"),
        email: getStringField(formData, "email"),
        username: getStringField(formData, "username"),
        uniqueUrlName: getStringField(formData, "uniqueUrlName"),
        accountType: getStringField(formData, "accountType"),
        isVipMember: getBooleanField(formData, "isVipMember"),
        isChangePass: getBooleanField(formData, "isChangePass"),
        profileImage: getStringField(formData, "profileImage"),
        userRole: getStringField(formData, "userRole"),
        teamRole: getStringField(formData, "teamRole") ?? null,
        password: getStringField(formData, "password"),
      });
    } else {
      const body = await req.json();
      validation = AdminUserUpdateSchema.safeParse(body);
    }

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = validation.data;
    const updatePayload: Record<string, unknown> = {};

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.accountType !== undefined)
      updatePayload.accountType = data.accountType;
    if (data.isVipMember !== undefined)
      updatePayload.isVipMember = data.isVipMember;
    if (data.isChangePass !== undefined)
      updatePayload.isChangePass = data.isChangePass;

    if (profileImageFile) {
      updatePayload.profileImage = await saveFile(
        profileImageFile,
        userId,
        {},
        "webp",
      );
    } else if (data.profileImage !== undefined) {
      updatePayload.profileImage = data.profileImage;
    }

    if (data.email !== undefined && data.email !== user.email) {
      const emailInUse = await User.findOne({
        email: data.email,
        _id: { $ne: userId },
      });
      if (emailInUse) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 400 },
        );
      }
      updatePayload.email = data.email;
    }

    if (data.username !== undefined && data.username !== user.username) {
      const usernameInUse = await User.findOne({
        username: data.username,
        _id: { $ne: userId },
      });
      if (usernameInUse) {
        return NextResponse.json(
          { error: "Username is already in use" },
          { status: 400 },
        );
      }
      updatePayload.username = data.username;
    }

    if (
      data.uniqueUrlName !== undefined &&
      data.uniqueUrlName !== user.uniqueUrlName
    ) {
      const urlInUse = await User.findOne({
        uniqueUrlName: data.uniqueUrlName,
        _id: { $ne: userId },
      });
      if (urlInUse) {
        return NextResponse.json(
          { error: "Unique URL name is already in use" },
          { status: 400 },
        );
      }
      updatePayload.uniqueUrlName = data.uniqueUrlName;
    }

    if (data.userRole !== undefined) {
      updatePayload["roles.userRole"] = data.userRole;
    }

    if (data.teamRole !== undefined) {
      updatePayload["roles.teamRole"] = data.teamRole;
    }

    if (data.password) {
      updatePayload.password = await bcrypt.hash(data.password, 10);
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatePayload },
      { new: true },
    )
      .select("-password")
      .populate("team", "name")
      .lean();

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
