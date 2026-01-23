"use server";

import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import SubTeam from "@/schemas/mongoose/SubTeam";
import Team from "@/schemas/mongoose/Team";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { saveFile } from "@/utils/upload";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ subTeamId: string }> }
) {
  try {
    const { subTeamId } = await params;
    const userId = await getUserIdFromToken(req);

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const permissionsStr = formData.get("permissions")?.toString().trim();
    const logoFile = formData.get("logo") as File | null;
    const newOwnerId = formData.get("ownerId")?.toString().trim();
    const adminsStr = formData.get("admins")?.toString().trim();

    if (newOwnerId && !isValidObjectId(newOwnerId)) {
      return NextResponse.json(
        { error: "Invalid new ownerId" },
        { status: 400 }
      );
    }

    let adminsArray: string[] | undefined;
    if (adminsStr) {
      try {
        adminsArray = JSON.parse(adminsStr);
        if (!Array.isArray(adminsArray)) {
          return NextResponse.json(
            { error: "Admins must be an array" },
            { status: 400 }
          );
        }
        for (const adminId of adminsArray) {
          if (!isValidObjectId(adminId)) {
            return NextResponse.json(
              { error: `Invalid admin ID: ${adminId}` },
              { status: 400 }
            );
          }
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid admins format" },
          { status: 400 }
        );
      }
    }

    const permissions = permissionsStr ? BigInt(permissionsStr) : undefined;
    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subTeam = await SubTeam.findById(subTeamId);
    if (!subTeam) {
      return NextResponse.json({ error: "SubTeam not found" }, { status: 404 });
    }

    const parentTeam = await Team.findById(subTeam.parentTeam);
    if (!parentTeam) {
      return NextResponse.json(
        { error: "Parent team not found" },
        { status: 404 }
      );
    }

    const isOwnerOrManager =
      user.roles.teamRole === "owner" || user.roles.teamRole === "manager";
    if (
      !isOwnerOrManager ||
      parentTeam._id.toString() !== user.team.toString()
    ) {
      return NextResponse.json(
        { error: "Unauthorized action" },
        { status: 403 }
      );
    }

    const updateData: Record<string, any> = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;

    if (logoFile) {
      const logoUrl = await saveFile(logoFile, user._id.toString(), {}, "webp");
      updateData.logo = logoUrl;
    }

    if (adminsArray) {
      updateData.admins = adminsArray;
    }

    if (newOwnerId && newOwnerId !== subTeam.owner?.toString()) {
      const oldOwnerId = subTeam.owner?.toString();
      updateData.owner = newOwnerId;

      if (oldOwnerId && isValidObjectId(oldOwnerId)) {
        const oldOwner = await User.findById(oldOwnerId);
        if (oldOwner) {
          oldOwner.roles.subTeamRole = oldOwner.roles.subTeamRole.map(
            (entry: {
              subTeamId: { toString: () => string };
              toObject: () => any;
            }) => {
              if (entry.subTeamId.toString() === subTeamId) {
                return { ...entry.toObject(), role: "member" };
              }
              return entry;
            }
          );
          await oldOwner.save();
        }
      }

      const newOwner = await User.findById(newOwnerId);
      if (!newOwner) {
        return NextResponse.json(
          { error: "New owner user not found" },
          { status: 404 }
        );
      }

      if (
        !newOwner.subTeams.some((id: string) => id.toString() === subTeamId)
      ) {
        newOwner.subTeams.push(subTeam._id);
      }

      const existingEntryIndex = newOwner.roles.subTeamRole.findIndex(
        (entry: { subTeamId: string }) =>
          entry.subTeamId.toString() === subTeamId
      );

      if (existingEntryIndex !== -1) {
        newOwner.roles.subTeamRole[existingEntryIndex].role = "owner";
      } else {
        newOwner.roles.subTeamRole.push({
          subTeamId: subTeam._id,
          role: "owner",
        });
      }

      await newOwner.save();
    }

    if (Object.keys(updateData).length > 0) {
      await SubTeam.findByIdAndUpdate(subTeamId, { $set: updateData });
    }

    if (typeof permissions === "bigint") {
      subTeam.permissions = permissions.toString();
      await subTeam.save();

      if (subTeam.members.length !== 0) {
        for (let i = 0; i < subTeam.members.length; i++) {
          const memberId = subTeam.members[i];
          if (!isValidObjectId(memberId)) continue;
          const submem = await User.findById(memberId);
          let newuserpermi = BigInt(0);
          for (let j = 0; j < submem.subTeams.length; j++) {
            const othersubb = await SubTeam.findById(submem.subTeams[j]);
            if (othersubb) {
              newuserpermi = newuserpermi | BigInt(othersubb.permissions);
            }
          }
          submem.permissions.subTeamPermission = newuserpermi.toString();
          await submem.save();
        }
      }
    }

    return NextResponse.json(
      { message: "SubTeam updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating SubTeam:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
