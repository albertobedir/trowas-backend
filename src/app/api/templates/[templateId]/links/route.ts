import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CardTemplate from "@/schemas/mongoose/Template"; // CardTemplate modelini import ediyoruz
import { isValidObjectId } from "mongoose";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import { getUserIfTeamRoleAllowed } from "@/utils/decorators/team-role.decorator";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const sessionId = await getUserIdFromToken(req);
    if (!sessionId || !isValidObjectId(sessionId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await params;
    if (!isValidObjectId(templateId)) {
      return NextResponse.json(
        { error: "Invalid template ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const body = await req.json(); // İstekten gelen veriyi alıyoruz
    console.log(body);

    const template = await CardTemplate.findById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Şablonun links alanını güncelliyoruz
    template.links = body;
    await template.save();

    return NextResponse.json({
      message: "Links updated successfully",
      links: template.links,
    });
  } catch (err) {
    console.error("Update links error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
