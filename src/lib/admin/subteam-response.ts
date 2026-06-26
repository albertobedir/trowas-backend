"use server";

import SubTeam from "@/schemas/mongoose/SubTeam";
import User from "@/schemas/mongoose/User";
import {
  AdminSubTeamLean,
  AdminUserLean,
} from "@/lib/admin/mongoose-lean-types";

export async function buildAdminSubteamResponse(subTeamId: string) {
  const subteam = await SubTeam.findById(subTeamId)
    .populate("owner", "name email profileImage username")
    .populate("parentTeam", "name")
    .populate("admins", "name email profileImage username")
    .lean<AdminSubTeamLean>();

  if (!subteam) return null;

  const parentTeamId =
    typeof subteam.parentTeam === "object" && subteam.parentTeam?._id
      ? subteam.parentTeam._id
      : subteam.parentTeam;

  const memberIdSet = new Set(
    (subteam.members || []).map((id) => id.toString()),
  );

  const [members, teamUsers] = await Promise.all([
    subteam.members?.length
      ? ((await User.find({ _id: { $in: subteam.members } })
          .select("name email username profileImage roles.teamRole createdAt")
          .sort({ name: 1 })
          .lean()) as unknown as AdminUserLean[])
      : ([] as AdminUserLean[]),
    parentTeamId
      ? ((await User.find({ team: parentTeamId })
          .select("name email username profileImage roles.teamRole createdAt")
          .sort({ name: 1 })
          .lean()) as unknown as AdminUserLean[])
      : ([] as AdminUserLean[]),
  ]);

  const availableMembers = teamUsers.filter(
    (user) => !memberIdSet.has(user._id.toString()),
  );

  return {
    ...subteam,
    members,
    availableMembers,
    memberCount: members.length,
  };
}
