import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";
import User from "@/schemas/mongoose/User";
import Lead from "@/schemas/mongoose/Lead";
import { Types } from "mongoose";
import dbConnect from "@/lib/db";

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    // Await the params since they're now a Promise
    const { leadId } = await params;

    if (!leadId || !Types.ObjectId.isValid(leadId)) {
      return NextResponse.json(
        { error: "Invalid lead ID" },
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

    // Find the lead
    const lead = await Lead.findById(leadId).lean();

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Check user permission
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // If user is a member, verify they own this lead
    if (user.roles?.teamRole === "member" && (lead as any).user?.id !== userId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Create CSV rows
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

    // Cast lead to any to avoid TypeScript errors since we know the shape from MongoDB
    const leadData = lead as any;

    // Add data row
    const row = [
      leadData._id,
      leadData.createdAt,
      leadData.type || 'N/A',
      leadData.user?.name || 'N/A',
      leadData.user?.email || 'N/A'
    ];

    // Add leadData fields if they exist
    const additionalData = leadData.leadData instanceof Map 
      ? Object.fromEntries(leadData.leadData)
      : leadData.leadData || {};
        
    row.push(JSON.stringify(additionalData).replace(/,/g, ';')); // Replace commas with semicolons in JSON to preserve CSV format

    csvRows.push(row.join(','));

    const csvContent = csvRows.join('\n');

    // Set response headers for CSV download
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'text/csv');
    responseHeaders.set('Content-Disposition', `attachment; filename=lead-${leadId}-export.csv`);

    return new NextResponse(csvContent, {
      status: 200,
      headers: responseHeaders
    });

  } catch (err) {
    console.error("Error exporting lead:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}