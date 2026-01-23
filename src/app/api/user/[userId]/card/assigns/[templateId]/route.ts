"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import { isValidObjectId } from "mongoose";
import CardTemplate from "@/schemas/mongoose/Template";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string; templateId: string }> }
) {
  try {
    const { userId, templateId } = await params;

    if (!isValidObjectId(userId) || !isValidObjectId(templateId)) {
      return NextResponse.json(
        { error: "Invalid userId or templateId" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const add: string[] = body.add || [];
    const remove: string[] = body.remove || [];

    // ❌ REMOVE USERS FROM TEMPLATE
    for (const memberId of remove) {
      if (!isValidObjectId(memberId)) continue;

      const member = await User.findById(memberId);
      const template = await CardTemplate.findById(templateId);
      if (!member || !template) continue;

      member.templates = (member.templates || []).filter(
        (id: any) => id.toString() !== templateId
      );

      template.members = (template.members || []).filter(
        (id: any) => id.toString() !== memberId
      );

      await member.save();
      await template.save();
    }

    // ✅ ADD USERS TO TEMPLATE
    for (const memberId of add) {
      if (!isValidObjectId(memberId)) continue;

      const member = await User.findById(memberId);
      const template = await CardTemplate.findById(templateId);
      if (!member || !template) continue;

      member.templates = member.templates || [];
      if (!member.templates.some((id: any) => id.toString() === templateId)) {
        member.templates.push(templateId);
      }

      template.members = template.members || [];
      if (!template.members.some((id: any) => id.toString() === memberId)) {
        template.members.push(memberId);
      }

      await member.save();
      await template.save();
    }

    return NextResponse.json(
      { message: "Templates updated successfully", data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating templates:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
