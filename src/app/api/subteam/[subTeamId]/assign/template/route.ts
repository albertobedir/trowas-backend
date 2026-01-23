"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { isValidObjectId } from "mongoose";
import SubTeam from "@/schemas/mongoose/SubTeam";
import User from "@/schemas/mongoose/User";
import Template from "@/schemas/mongoose/Template";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ subTeamId: string }> }
) {
  try {
    const { subTeamId } = await params;

    if (!isValidObjectId(subTeamId)) {
      return NextResponse.json({ error: "Invalid subTeamId" }, { status: 400 });
    }

    await dbConnect();

    const subTeam = await SubTeam.findById(subTeamId);
    if (!subTeam) {
      return NextResponse.json({ error: "SubTeam not found" }, { status: 404 });
    }

    const body = await req.json();
    const templateIds: string[] = body.templateIds || [];

    // Reset templates array
    subTeam.templates = [];    // First remove all existing template associations
    const oldTemplates = subTeam.templates || [];
    
    // Remove template associations from users
    for (const memberId of subTeam.members) {
      const user = await User.findById(memberId);
      if (user && Array.isArray(user.templates)) {
        user.templates = user.templates.filter((templateId: any) => 
          !oldTemplates.some((oldId: any) => oldId.toString() === templateId.toString())
        );
        await user.save();
      }
    }

    // Remove member associations from templates
    for (const oldTemplateId of oldTemplates) {
      const template = await Template.findById(oldTemplateId);
      if (template && Array.isArray(template.members)) {
        template.members = template.members.filter((memberId: any) => 
          !subTeam.members.some((teamMemberId: any) => teamMemberId.toString() === memberId.toString())
        );
        await template.save();
      }
    }

    // Add new template associations
    for (const templateId of templateIds) {
      if (!isValidObjectId(templateId)) continue;

      subTeam.templates.push(templateId);

      for (const memberId of subTeam.members) {
        const user = await User.findById(memberId);
        if (user) {
          user.templates = user.templates || [];
          if (!user.templates.some((id: any) => id.toString() === templateId)) {
            user.templates.push(templateId);
            await user.save();
          }
        }

        const template = await Template.findById(templateId);
        if (template) {
          template.members = template.members || [];
          if (!template.members.some((id: any) => id.toString() === memberId.toString())) {
            template.members.push(memberId);
            await template.save();
          }
        }
      }
    }

    await subTeam.save();

    return NextResponse.json(
      {
        message: "Templates updated successfully",
        templates: subTeam.templates,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in template assignment:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
