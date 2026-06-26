"use server";

import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import Lead from "@/schemas/mongoose/Lead";
import Team from "@/schemas/mongoose/Team";
import dbConnect from "@/lib/db";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
  extractLeadEmail,
  extractLeadPhone,
  extractLeadTitle,
  normalizeLeadData,
} from "@/lib/admin/lead-utils";

type RouteContext = { params: Promise<{ leadId: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { leadId } = await params;
    if (!isValidObjectId(leadId)) {
      return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 });
    }

    await dbConnect();

    const lead = await Lead.findById(leadId).lean();
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const leadData = normalizeLeadData(lead.leadData);
    const team = lead.teamId
      ? await Team.findById(lead.teamId).select("name owner").lean()
      : null;

    return NextResponse.json({
      _id: lead._id,
      title: extractLeadTitle(leadData),
      email: extractLeadEmail(leadData),
      phone: extractLeadPhone(leadData),
      type:
        typeof leadData.type === "string"
          ? leadData.type
          : typeof (lead as { type?: string }).type === "string"
            ? (lead as { type?: string }).type
            : undefined,
      leadData,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      sendAfter: lead.sendAfter,
      user: lead.user
        ? {
            id: lead.user.id,
            name: lead.user.name,
            profileImage: lead.user.profileImage,
          }
        : null,
      team: team
        ? {
            _id: team._id,
            name: team.name,
          }
        : null,
    });
  } catch (error) {
    console.error("Admin get lead error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
