import { isValidObjectId, Types } from "mongoose";
import User from "@/schemas/mongoose/User";
import SubTeam from "@/schemas/mongoose/SubTeam";
import Template from "@/schemas/mongoose/Template";

export async function updateSubteamMembers(
  subTeamId: string,
  add: string[],
  remove: string[],
) {
  const subTeam = await SubTeam.findById(subTeamId);
  if (!subTeam) throw new Error("Sub-team not found");

  const parentTeamId = subTeam.parentTeam?.toString();
  if (!parentTeamId) throw new Error("Parent team not found");

  for (const targetUserId of remove) {
    if (!isValidObjectId(targetUserId)) continue;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser || targetUser.team?.toString() !== parentTeamId) continue;

    subTeam.members = subTeam.members.filter(
      (id: Types.ObjectId) => id.toString() !== targetUserId,
    );

    targetUser.subTeams = targetUser.subTeams.filter(
      (id: Types.ObjectId) => id.toString() !== subTeamId,
    );

    if (typeof subTeam.permissions === "string") {
      targetUser.permissions.subTeamPermission = (
        BigInt(targetUser.permissions.subTeamPermission || 0n) &
        ~BigInt(subTeam.permissions)
      ).toString();

      for (const otherSubTeamId of targetUser.subTeams) {
        if (otherSubTeamId.toString() !== subTeamId) {
          const other = await SubTeam.findById(otherSubTeamId);
          if (other?.permissions) {
            targetUser.permissions.subTeamPermission = (
              BigInt(targetUser.permissions.subTeamPermission) |
              BigInt(other.permissions)
            ).toString();
          }
        }
      }
    }

    if (Array.isArray(subTeam.templates)) {
      const filteredTemplates = targetUser.templates?.filter(
        (templateId: Types.ObjectId) =>
          !subTeam.templates.some(
            (subTemplateId: Types.ObjectId) =>
              subTemplateId.toString() === templateId.toString(),
          ),
      );

      for (const templateId of subTeam.templates) {
        const template = await Template.findById(templateId);
        if (template && Array.isArray(template.members)) {
          template.members = template.members.filter(
            (id: Types.ObjectId) => id.toString() !== targetUserId,
          );
          await template.save();
        }
      }

      targetUser.templates = filteredTemplates;
    }

    await targetUser.save();
  }

  for (const targetUserId of add) {
    if (!isValidObjectId(targetUserId)) continue;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser || targetUser.team?.toString() !== parentTeamId) continue;

    if (!subTeam.members.some((id: Types.ObjectId) => id.toString() === targetUserId)) {
      subTeam.members.push(targetUserId as unknown as typeof subTeam.members[0]);
    }

    if (!targetUser.subTeams.some((id: Types.ObjectId) => id.toString() === subTeamId)) {
      targetUser.subTeams.push(subTeamId as unknown as typeof targetUser.subTeams[0]);
    }

    if (typeof subTeam.permissions === "string") {
      targetUser.permissions.subTeamPermission = (
        BigInt(targetUser.permissions.subTeamPermission || 0n) |
        BigInt(subTeam.permissions)
      ).toString();
    }

    if (Array.isArray(subTeam.templates) && subTeam.templates.length > 0) {
      const userTemplateSet = new Set(
        (targetUser.templates || []).map((id: Types.ObjectId) => id.toString()),
      );

      for (const templateId of subTeam.templates) {
        userTemplateSet.add(templateId.toString());
        const template = await Template.findById(templateId);
        if (template) {
          template.members = template.members || [];
          if (
            !template.members.some((id: Types.ObjectId) => id.toString() === targetUserId)
          ) {
            template.members.push(targetUserId as unknown as typeof template.members[0]);
            await template.save();
          }
        }
      }

      targetUser.templates = Array.from(userTemplateSet) as typeof targetUser.templates;
    }

    await targetUser.save();
  }

  await subTeam.save();
  return subTeam;
}
