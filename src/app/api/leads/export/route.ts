import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import User from "@/schemas/mongoose/User";
import Lead from "@/schemas/mongoose/Lead";
import { Types } from "mongoose";
import dbConnect from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const teamId = url.searchParams.get("teamId");

    if (!teamId || !Types.ObjectId.isValid(teamId)) {
      return NextResponse.json(
        { error: "Invalid or missing team ID" },
        { status: 400 }
      );
    }

    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Build query based on role
    const query: any = user.roles?.teamRole === "member" 
      ? { teamId: new Types.ObjectId(teamId), "user._id": userId }
      : { teamId: new Types.ObjectId(teamId) };

    // Fetch all leads with full data
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Transform leads to CSV format
    const csvRows = [];
    
    // Add CSV headers
    const csvHeaders = [
      'Lead ID',
      'Created Date',
      'Type',
      'Connected User Name',
      'Connected User Email',
      'Lead Data Fields'
    ];
    csvRows.push(csvHeaders.join(','));

    // Add data rows
    for (const lead of leads) {
      const row = [
        lead._id,
        lead.createdAt,
        lead.type || 'N/A',
        lead.user?.name || 'N/A',
        lead.user?.email || 'N/A'
      ];

      // Add leadData fields if they exist
      const leadData = lead.leadData instanceof Map 
        ? Object.fromEntries(lead.leadData) 
        : lead.leadData || {};
      
      row.push(JSON.stringify(leadData).replace(/,/g, ';')); // Replace commas with semicolons in JSON to preserve CSV format

      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    // Set response headers for CSV download
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'text/csv');
    responseHeaders.set('Content-Disposition', 'attachment; filename=leads-export.csv');

    return new NextResponse(csvContent, {
      status: 200,
      headers: responseHeaders
    });

  } catch (err) {
    console.error("Error exporting leads:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}