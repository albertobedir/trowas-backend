import dbConnect from "@/lib/db";
import Lead from "@/schemas/mongoose/Lead";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

interface User {
  id: string;
  name: string;
  profileImage: string;
}

interface LeadData {
  [key: string]: any;
}

interface LeadDocument {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  userId: Types.ObjectId;
  leadData: LeadData;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ leadid: string }> }
) {
  try {
    const { leadid } = await params;
    if (!Types.ObjectId.isValid(leadid)) {
      return NextResponse.json(
        { error: "Invalid or missing lead ID" },
        { status: 400 }
      );
    }await dbConnect();

    const lead = await Lead.findById(leadid).lean<LeadDocument>();

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const response = {
      ...lead,
      user: lead.user
        ? {
            id: lead.user.id,
            name: lead.user.name,
            profileImage: lead.user.profileImage,
          }
        : null,
    };

    return NextResponse.json({
      lead: response,
    });
  } catch (err) {
    console.error("Error fetching lead:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}