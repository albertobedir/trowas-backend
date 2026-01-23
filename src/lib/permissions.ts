import User from "@/schemas/mongoose/User";
import { NextResponse } from "next/server";

export enum Permissions {
  PENDING_TO_MEMBER = 1 << 0,
  MEMBER_TO_MANAGER = 1 << 1,
  MANAGER_TO_MEMBER = 1 << 2,
}

export enum TeamRole {
  PENDING = 1,
  MEMBER = 0,
  MANAGER = 2,
  OWNER = 6,
}

export function hasPermission(
  role: TeamRole,
  permission: Permissions
): boolean {
  return (role & permission) === permission;
}

export const upgradeRole = async (
  subRole: TeamRole,
  toRole: TeamRole,
  memberId: string
) => {
  const member = await User.findById(memberId);
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  console.log(member);

  switch (`${member.permissions.teamPermission}->${toRole}`) {
    case `${TeamRole.PENDING}->${TeamRole.MEMBER}`:
      if (hasPermission(subRole, Permissions.PENDING_TO_MEMBER)) {
        member.roles.teamRole = "member";
        member.permissions.teamPermission = 0;
        await member.save();
        return NextResponse.json(
          { message: "Role upgraded to MEMBER" },
          { status: 200 }
        );
      }
      break;

    case `${TeamRole.MEMBER}->${TeamRole.MANAGER}`:
      if (hasPermission(subRole, Permissions.MEMBER_TO_MANAGER)) {
        member.roles.teamRole = "manager";
        member.permissions.teamPermission = 2;
        await member.save();
        return NextResponse.json(
          { message: "Role upgraded to MANAGER" },
          { status: 200 }
        );
      }
      break;

    case `${TeamRole.MANAGER}->${TeamRole.MEMBER}`:
      if (hasPermission(subRole, Permissions.MANAGER_TO_MEMBER)) {
        member.roles.teamRole = "member";
        member.permissions.teamPermission = 0;
        await member.save();
        return NextResponse.json(
          { message: "Role downgraded to MEMBER" },
          { status: 200 }
        );
      }
      break;

    default:
      return NextResponse.json(
        { error: "Invalid role transition" },
        { status: 400 }
      );
  }

  return NextResponse.json(
    { error: "You do not have permission to change this role." },
    { status: 403 }
  );
};
