import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import User from "@/schemas/mongoose/User";
import UserCard from "@/schemas/mongoose/UserCard";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

interface PerformanceData {
  pipelineGenerated: number;
  leadsCaptured: number;
  cardViews: any[];
  cardConnects: any[];
  linkTaps: any[];
  viewsCount: number;
  connectsCount: number;
  tapsCount: number;
  viewsData: Array<{
    name: string;
    views: number;
    leads: number;
    saves: number;
    date: string;
  }>;
  totalviewstype: Array<{
    name: string;
    value: number;
  }>;
  topPerformers: Array<{
    name: string;
    avatar: string;
    views: number;
    taps: number;
    leads: number;
  }>;
  topTappedLinks: Array<{
    link: string;
    pUser: string;
    cardName: string;
    avatar: string;
    taps: number;
  }>;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    await dbConnect();

    const params = await context.params;
    const { teamId } = params;
    
    if (!isValidObjectId(teamId)) {
      return NextResponse.json(
        { error: "Invalid team ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Get today's date and ensure we're working with the local date
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    // Set end date
    const endDate = endDateParam ? new Date(endDateParam) : today;

    // Set start date (7 days including today means we go back 6 days)
    const startDate = startDateParam 
      ? new Date(startDateParam)
      : new Date(today);
    
    if (!startDateParam) {
      startDate.setDate(startDate.getDate() - 6); // Go back 6 days from today
      startDate.setHours(23, 59, 59, 999);
    }

    const team = await Team.findById(teamId).select("teamPerformance");

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    const tp = team.teamPerformance;

    const filterByDate = (arr: any[]) => {
      if (!arr) return [];
      return arr.filter((item) => {
        const createdAt = item.createdAt;
        if (!createdAt) return false;
        
        const itemDate = new Date(createdAt);
        // Set itemDate to start of its day for proper comparison
        itemDate.setHours(0, 0, 0, 0);
        
        // Compare dates only (ignoring time)
        const startCompare = new Date(startDate);
        const endCompare = new Date(endDate);
        startCompare.setHours(0, 0, 0, 0);
        endCompare.setHours(0, 0, 0, 0);
        
        return itemDate >= startCompare && itemDate <= endCompare;
      });
    };

    // Generate daily stats for the date range
    const dayStats = new Map();
    const dateRange = [];
    
    // Create array of all dates in range
    const tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      const dateStr = tempDate.toISOString().split('T')[0];
      dateRange.push(dateStr);
      dayStats.set(dateStr, { views: 0, leads: 0, saves: 0 });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Count views per day
    const filteredViews = filterByDate(tp.cardViews || []);
    filteredViews.forEach(view => {
      const dateStr = new Date(view.createdAt).toISOString().split('T')[0];
      const stats = dayStats.get(dateStr) || { views: 0, leads: 0, saves: 0 };
      stats.views++;
      dayStats.set(dateStr, stats);
    });

    // Count card connects per day (saves)
    const filteredSaves = filterByDate(tp.cardConnects || []);
    filteredSaves.forEach(save => {
      const dateStr = new Date(save.createdAt).toISOString().split('T')[0];
      const stats = dayStats.get(dateStr) || { views: 0, leads: 0, saves: 0 };
      stats.saves++;
      dayStats.set(dateStr, stats);
    });

    // Count leads per day
    const filteredLeads = filterByDate(tp.cardConnects || []);
    filteredLeads.forEach(lead => {
      const dateStr = new Date(lead.createdAt).toISOString().split('T')[0];
      const stats = dayStats.get(dateStr) || { views: 0, leads: 0, saves: 0 };
      stats.leads++;
      dayStats.set(dateStr, stats);
    });

    // Format the data for response
    const viewsData = dateRange.map(date => {
      const stats = dayStats.get(date) || { views: 0, leads: 0, saves: 0 };
      return {
        name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: stats.views,
        leads: stats.leads,
        saves: stats.saves,
        date: date
      };
    });

    // Count views by from field
    // For Link Share: from can be "null", "0", null, or undefined
    const linkShareViews = filteredViews.filter(view => {
      console.log('View from value:', view.from);
      return view.from === "null" || 
             view.from === "0" || 
             view.from === null || 
             view.from === undefined;
    }).length;
    
    // For QR Code: from should be "1"
    const qrCodeViews = filteredViews.filter(view => view.from === "1").length;
    const totalViews = filteredViews.length;

    console.log('Link Share Views:', linkShareViews);
    console.log('QR Code Views:', qrCodeViews);
    console.log('Total Views:', totalViews);

    // Calculate percentages (rounded to 2 decimal places)
    const linkSharePercentage = totalViews > 0 ? Math.round((linkShareViews / totalViews) * 100 * 100) / 100 : 0;
    const qrCodePercentage = totalViews > 0 ? Math.round((qrCodeViews / totalViews) * 100 * 100) / 100 : 0;

    console.log('Link Share Percentage:', linkSharePercentage);
    console.log('QR Code Percentage:', qrCodePercentage);

    // Aggregate performance data by user
    const userPerformance = new Map();

    // Aggregate views by userId
    filteredViews.forEach(view => {
      const userId = view.userId?.toString();
      if (!userId) return;
      
      if (!userPerformance.has(userId)) {
        userPerformance.set(userId, { views: 0, taps: 0, leads: 0 });
      }
      userPerformance.get(userId).views++;
    });

    // Aggregate taps by userId
    filterByDate(tp.linkTaps || []).forEach(tap => {
      const userId = tap.userId?.toString();
      if (!userId) return;
      
      if (!userPerformance.has(userId)) {
        userPerformance.set(userId, { views: 0, taps: 0, leads: 0 });
      }
      userPerformance.get(userId).taps++;
    });

    // Aggregate leads by userId
    filteredLeads.forEach(lead => {
      const userId = lead.userId?.toString();
      if (!userId) return;
      
      if (!userPerformance.has(userId)) {
        userPerformance.set(userId, { views: 0, taps: 0, leads: 0 });
      }
      userPerformance.get(userId).leads++;
    });

    // Get user details and create top performers array
    const performerUserIds = Array.from(userPerformance.keys());
    const performerUsers = await User.find({ _id: { $in: performerUserIds } }).select('name profileImage');
    
    // Create top performers array with user details
    const topPerformers = performerUsers.map(user => {
      const performance = userPerformance.get(user._id.toString());
      return {
        name: user.name,
        avatar: user.profileImage || '/defaultpp.png', // Use default avatar if none exists
        views: performance?.views || 0,
        taps: performance?.taps || 0,
        leads: performance?.leads || 0
      };
    })
    // Sort by views (primary) and leads (secondary)
    .sort((a, b) => {
      if (b.views !== a.views) return b.views - a.views;
      return b.leads - a.leads;
    })
    // Take top 5
    .slice(0, 5);

    // Calculate top tapped links
    const linkTapsMap = new Map();
    const filteredLinkTaps = filterByDate(tp.linkTaps || []);
    
    // Collect all userCardIds and userIds for links
    const tapUserCardIds = new Set();
    const tapUserIds = new Set();
    
    filteredLinkTaps.forEach(tap => {
      if (tap.userCardId) tapUserCardIds.add(tap.userCardId.toString());
      if (tap.userId) tapUserIds.add(tap.userId.toString());
    });

    // Fetch user cards and users data for links
    const tapUserCards = await UserCard.find({ _id: { $in: Array.from(tapUserCardIds) } })
      .select('cardName _id');
    const tapUsers = await User.find({ _id: { $in: Array.from(tapUserIds) } })
      .select('name profileImage _id');

    // Create maps for quick lookup
    const userCardsMap = new Map(tapUserCards.map((card: any) => [card._id.toString(), card]));
    const usersMap = new Map(tapUsers.map((user: any) => [user._id.toString(), user]));

    filteredLinkTaps.forEach(tap => {
      const linkKey = tap.linkName || 'Unknown Link';
      const userCard: any = tap.userCardId ? userCardsMap.get(tap.userCardId.toString()) : null;
      const user: any = tap.userId ? usersMap.get(tap.userId.toString()) : null;

      const currentCount = linkTapsMap.get(linkKey) || {
        link: linkKey,
        pUser: user?.name || 'Unknown User',
        cardName: userCard?.cardName || 'Unknown Card',
        avatar: user?.profileImage || '/defaultpp.png',
        taps: 0
      };
      currentCount.taps++;
      linkTapsMap.set(linkKey, currentCount);
    });

    const topTappedLinks = Array.from(linkTapsMap.values())
      .sort((a, b) => b.taps - a.taps)
      .slice(0, 5);

    const performanceData: PerformanceData = {
      pipelineGenerated: tp.pipelineGenerated || 0,
      leadsCaptured: tp.leadsCaptured || 0,
      cardViews: filteredViews,
      cardConnects: filteredLeads,
      linkTaps: filterByDate(tp.linkTaps || []),
      viewsCount: filteredViews.length,
      connectsCount: filteredLeads.length,
      tapsCount: filterByDate(tp.linkTaps || []).length,
      viewsData: viewsData,
      totalviewstype: [
        { name: "Link Share", value: linkSharePercentage },
        { name: "Qr Code", value: qrCodePercentage }
      ],
      topPerformers: topPerformers,
      topTappedLinks: topTappedLinks
    };

    return NextResponse.json({
      data: performanceData
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching team performance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}