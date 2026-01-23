import jwt from "jsonwebtoken";
import User from "@/schemas/mongoose/User";
import dbConnect from "@/lib/db";
import { getUserIdFromToken } from "./id-decorator";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";

export async function getUserIfTeamRoleAllowed(
  req: Request,
  allowedRoles: string[]
): Promise<any | null> {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user || !user.roles?.teamRole) return null;

    if (!allowedRoles.includes(user.roles.teamRole)) return null;

    return user;
  } catch (error) {
    console.error("Role check failed:", error);
    return null;
  }
}
