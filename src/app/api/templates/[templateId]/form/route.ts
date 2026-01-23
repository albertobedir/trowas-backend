import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CardTemplate from "@/schemas/mongoose/Template";
import { isValidObjectId } from "mongoose";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";

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

    const template = await CardTemplate.findById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Şablonun leadForm alanını güncelliyoruz
    template.leadForm = body;
    await template.save();

    return NextResponse.json({
      message: "Lead form updated successfully",
      leadForm: template.leadForm,
    });
  } catch (err) {
    console.error("Update lead form error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
