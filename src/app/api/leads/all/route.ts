import dbConnect from "@/lib/db";
import Lead from "@/schemas/mongoose/Lead";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import User from "@/schemas/mongoose/User";

function formatDate(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const teamId = url.searchParams.get("teamId");
    const currentPage = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("size") || "100", 10);

    if (!teamId || !Types.ObjectId.isValid(teamId)) {
      return NextResponse.json(
        { error: "Invalid or missing team ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get user from token
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user and check role
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build query based on role
    const query: any = { teamId: new Types.ObjectId(teamId) };
    if (user.roles?.teamRole === "member") {
      // If user is a member, only show their leads
      query["user.id"] = userId;
    }

    const totalCount = await Lead.countDocuments(query);

    const skip = (currentPage - 1) * pageSize;

    const rawLeads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const allowedFields = ["Full Name", "name", "Email", "phone"];

    const leads = rawLeads.map((lead) => {
      const filtered: any = {
        _id: lead._id,
        type: lead.type,
        createdAt: formatDate(lead.createdAt),
      };

      const leadData =
        lead.leadData instanceof Map
          ? Object.fromEntries(lead.leadData)
          : lead.leadData || {};
      if (
        "Full Name" in leadData &&
        typeof leadData["Full Name"] === "string"
      ) {
        filtered.title = leadData["Full Name"];
      }
      allowedFields.forEach((key) => {
        if (key in leadData && typeof leadData[key] === "string") {
          filtered.title = leadData[key];
        }
      });

      if (Object.keys(filtered).length === 1 && !filtered.title) {
        for (const key in leadData) {
          if (typeof leadData[key] === "string") {
            filtered.title = leadData[key];
            break;
          }
        }
      }

      if (lead.user) {
        filtered.user = {
          id: lead.user.id,
          name: lead.user.name,
          profileImage: lead.user.profileImage,
        };
      }

      return filtered;
    });

    return NextResponse.json({
      totalCount,
      currentPage,
      pageSize,
      leads,
    });
  } catch (err) {
    console.error("Error fetching leads:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
