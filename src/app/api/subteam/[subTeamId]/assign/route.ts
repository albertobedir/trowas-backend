"use server";

import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import SubTeam from "@/schemas/mongoose/SubTeam";
import Template from "@/schemas/mongoose/Template"; // ⬅️ Template modeli eklendi
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ subTeamId: string }> }
) {
  try {
    const { subTeamId } = await params;
    const userId = await getUserIdFromToken(req);

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const add = body.add || [];
    const remove = body.remove || [];

    if (!isValidObjectId(subTeamId)) {
      return NextResponse.json(
        { error: "Invalid subTeam ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const subTeam = await SubTeam.findById(subTeamId);
    if (!subTeam) {
      return NextResponse.json({ error: "SubTeam not found" }, { status: 404 });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ❌ REMOVE users
    for (const targetUserId of remove) {
      if (!isValidObjectId(targetUserId)) continue;

      const targetUser = await User.findById(targetUserId);
      if (
        !targetUser ||
        targetUser.team.toString() !== currentUser.team.toString()
      )
        continue;

      subTeam.members = subTeam.members.filter(
        (id: string) => id.toString() !== targetUserId
      );

      targetUser.subTeams = targetUser.subTeams.filter(
        (id: string) => id.toString() !== subTeamId
      );

      if (typeof subTeam.permissions === "string") {
        targetUser.permissions.subTeamPermission = (
          BigInt(targetUser.permissions.subTeamPermission || 0n) &
          ~BigInt(subTeam.permissions)
        ).toString();

        for (const otherSubTeamId of targetUser.subTeams) {
          if (otherSubTeamId.toString() !== subTeamId) {
            const other = await SubTeam.findById(otherSubTeamId);
            if (other) {
              targetUser.permissions.subTeamPermission = (
                BigInt(targetUser.permissions.subTeamPermission) |
                BigInt(other.permissions)
              ).toString();
            }
          }
        }
      }

      // Remove templates of this subteam from user AND update template.members
      if (Array.isArray(subTeam.templates)) {
        const filteredTemplates = targetUser.templates?.filter(
          (templateId: any) =>
            !subTeam.templates.some(
              (subTemplateId: any) =>
                subTemplateId.toString() === templateId.toString()
            )
        );

        for (const templateId of subTeam.templates) {
          const template = await Template.findById(templateId);
          if (template && Array.isArray(template.members)) {
            template.members = template.members.filter(
              (id: any) => id.toString() !== targetUserId
            );
            await template.save();
          }
        }

        targetUser.templates = filteredTemplates;
      }

      await targetUser.save();
    }

    // ✅ ADD users
    for (const targetUserId of add) {
      if (!isValidObjectId(targetUserId)) continue;

      const targetUser = await User.findById(targetUserId);
      if (
        !targetUser ||
        targetUser.team.toString() !== currentUser.team.toString()
      )
        continue;

      if (!subTeam.members.includes(targetUserId)) {
        subTeam.members.push(targetUserId);
      }

      if (!targetUser.subTeams.includes(subTeamId)) {
        targetUser.subTeams.push(subTeamId);
      }

      if (typeof subTeam.permissions === "string") {
        targetUser.permissions.subTeamPermission = (
          BigInt(targetUser.permissions.subTeamPermission || 0n) |
          BigInt(subTeam.permissions)
        ).toString();
      }

      // Add templates from subTeam to user and update template.members
      if (Array.isArray(subTeam.templates) && subTeam.templates.length > 0) {
        const userTemplateSet = new Set([
          ...(targetUser.templates || []).map((id: any) => id.toString()),
        ]);

        for (const templateId of subTeam.templates) {
          userTemplateSet.add(templateId.toString());

          const template = await Template.findById(templateId);
          if (template) {
            template.members = template.members || [];

            const alreadyIncluded = template.members.some(
              (id: any) => id.toString() === targetUserId
            );
            if (!alreadyIncluded) {
              template.members.push(targetUserId);
              await template.save();
            }
          }
        }

        targetUser.templates = Array.from(userTemplateSet);
      }

      await targetUser.save();
    }

    await subTeam.save();

    return NextResponse.json(
      { message: "Users updated in subteam successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating subteam users:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
