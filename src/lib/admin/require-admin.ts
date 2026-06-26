import { NextResponse } from "next/server";
import { isAdminFromRequest } from "@/utils/decorators/admin-decorator";

export async function requireAdmin(
  req: Request,
): Promise<NextResponse | null> {
  const isAdmin = await isAdminFromRequest(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
