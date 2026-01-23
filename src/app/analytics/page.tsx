"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, Download, Filter, ArrowUpRight, Users, Link as LinkIcon, CreditCard, ChevronRight, UserPlus, ArrowRight, Target, ChevronDown, Check } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, BarChart, Bar } from "recharts";
import { useEffect, useState } from "react";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { usePageLoading } from "@/hooks/use-page-loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/store/user-store";
import { useTeamStore } from "@/store/team-store";
import { Api } from "@/lib/api";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const viewsData = [
  { name: "Jan", views: 400, leads: 250 },
  { name: "Feb", views: 300, leads: 420 },
  { name: "Mar", views: 600, leads: 380 },
  { name: "Apr", views: 800, leads: 520 },
  { name: "May", views: 500, leads: 600 },
  { name: "Jun", views: 700, leads: 480 },
];

type CardView = {
  userId: string;
  userCardId: string;
  views: number;
  from: string;
  _id: string;
  createdAt: string;
};

type CardConnect = {
  userId: string;
  userCardId: string;
  conenct: number;
  _id: string;
  createdAt: string;
};

type LinkTap = {
  linkName: string;
  userId: string;
  userCardId: string;
  taps: number;
  _id: string;
  createdAt: string;
};

type ViewsDataItem = {
  name: string;
  views: number;
  leads: number;
  saves: number;
  date: string;
};

type TotalViewsTypeItem = {
  name: string;
  value: number;
};

type TopPerformer = {
  name: string;
  avatar: string;
  views: number;
  taps: number;
  leads: number;
};

type TopTappedLink = {
  link: string;
  pUser: string;
  cardName: string;
  avatar: string;
  taps: number;
};

type PerformanceData = {
  pipelineGenerated: number;
  leadsCaptured: number;
  cardViews: CardView[];
  cardConnects: CardConnect[];
  linkTaps: LinkTap[];
  viewsCount: number;
  connectsCount: number;
  tapsCount: number;
  viewsData: ViewsDataItem[];
  totalviewstype: TotalViewsTypeItem[];
  topPerformers: TopPerformer[];
  topTappedLinks: TopTappedLink[];
};



const leadStatusData = [
  { name: "New", value: 35 },
  { name: "In Progress", value: 25 },
  { name: "Qualified", value: 25 },
  { name: "Lost", value: 15 },
];

const performanceData = [
  { name: "Mon", value: 20 },
  { name: "Tue", value: 40 },
  { name: "Wed", value: 30 },
  { name: "Thu", value: 70 },
  { name: "Fri", value: 40 },
  { name: "Sat", value: 30 },
  { name: "Sun", value: 20 },
];

const COLORS = ['#4361ee', '#3a0ca3', '#7209b7', '#f72585'];
const STATUS_COLORS = ['#4cc9f0', '#4895ef', '#560bad', '#f72585'];

const filterGroups = [
  {
    name: "Subteams",
    items: ["Development", "Design", "Marketing", "Sales", "HR"]
  },
  {
    name: "Members",
    items: ["Faruk Çubuk", "Servet", "Tolunay Kurttutar", "Murat Bilir", "Yılmaz Emre Pala"]
  }
];

const springConfig = {
  type: "spring",
  stiffness: 700,
  damping: 30
};

const activities = [
  { time: "2 min ago", text: "John viewed your card" },
  { time: "5 min ago", text: "New lead generated from LinkedIn" },
  { time: "10 min ago", text: "Sarah downloaded contact info" },
  { time: "1 hour ago", text: "Marketing campaign started" },
];

const memberData = [
  {
    name: "Faruk Çubuk",
    avatar: "/avatars/faruk.png",
    views: 13,
    taps: 0,
    leads: 2
  },
  {
    name: "Servet",
    avatar: "/avatars/servet.png",
    views: 1,
    taps: 0,
    leads: 0
  },
  {
    name: "Tolunay Kurttutar",
    avatar: "/avatars/tolunay.png",
    views: 0,
    taps: 0,
    leads: 0
  },
  {
    name: "Murat Bilir",
    avatar: "/avatars/murat.png",
    views: 0,
    taps: 0,
    leads: 0
  },
  {
    name: "Yılmaz Emre Pala",
    avatar: "/avatars/yilmaz.png",
    views: 2,
    taps: 0,
    leads: 0
  }
];



// Dynamic client-only component wrapper
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return <div className="h-full w-full bg-gray-50  animate-pulse rounded-md"></div>;
  }
  
  return <>{children}</>;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color?: string;
  }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="text-sm font-semibold">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { user, fetchUser, isLoading: isUserLoading } = useUserStore();
  const { teams, fetchTeam, setTeam, isLoading: isTeamLoading } = useTeamStore();
  const team = user?.team ? teams[user.team] : null;
  const [dataleads, setdataleads] = useState<any[]>([]);
  const today = new Date();
const [date, setDate] = useState<DateRange | undefined>(undefined);
  // Filter states
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
  const [contentHeight, setContentHeight] = useState<number | string>("auto");
  
  const hasSelectedFilters = Object.values(selectedFilters).some(filters => filters.length > 0);

  
  
  // Filter handler functions
  const handleCollapsibleChange = (isOpen: boolean, groupName: string) => {
    setOpenCollapsible(isOpen ? groupName : null);
    setContentHeight(isOpen ? 400 : 200);
  };

  const handleFilterSelect = (group: string, item: string) => {
    setSelectedFilters(prev => {
      const groupFilters = prev[group] || [];
      if (groupFilters.includes(item)) {
        return {
          ...prev,
          [group]: groupFilters.filter(i => i !== item)
        };
      } else {
        return {
          ...prev,
          [group]: [...groupFilters, item]
        };
      }
    });
  };

  const clearFilters = () => {
    setSelectedFilters({});
  };
  
  const isLoading = usePageLoading();
  useEffect(() => {
      // Fetch user data from the global store if not already loaded
      fetchUser();
    }, [fetchUser]);
    useEffect(() => {
      // Get the teamId from the user object and fetch team data when user is loaded
      if (user?.team) {
        fetchTeam(user.team);
      }
    }, [fetchTeam, user]);
    
      const [apiResponse, setApiResponse] = useState<PerformanceData | null>(null);
  
    useEffect(() => {
      (async () => {
        if (!isUserLoading && user) {
          const leaddatares = await Api.get(`/leads/all?teamId=${user?.team}&page=1&size=100`);
          setdataleads(leaddatares?.data?.leads);
          
          // Construct the URL with date parameters if date range is selected
          let performanceUrl = `/teams/${user?.team}/get-performance`;
          if (date?.from && date?.to) {
            const startDate = date.from.toISOString().split('T')[0];
            const endDate = date.to.toISOString().split('T')[0];
            performanceUrl += `?startDate=${startDate}&endDate=${endDate}`;
          }
          
          const performansds = await Api.get(performanceUrl);
          setApiResponse(performansds?.data.data);
        }
  
      })()
    },  [user, date, isUserLoading]);
    console.log(dataleads);
  if (isLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="p-6  min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white shadow-sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0">
              <LayoutGroup>
                <motion.div
                  className="flex flex-col relative"
                  animate={{
                    height: contentHeight
                  }}
                  transition={springConfig}
                >
                  <div className="flex-1 overflow-y-auto p-4">
                    <Input
                      className="mb-4 bg-black/5 border-none rounded-full"
                      placeholder="Search..."
                    />
                    <div className="space-y-4 pb-16">
                      {filterGroups.map((group) => (
                        <Collapsible
                          key={group.name}
                          open={openCollapsible === group.name}
                          onOpenChange={(isOpen) => handleCollapsibleChange(isOpen, group.name)}
                        >
                          <motion.div layout>
                            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl text-black/70 px-3 py-4 text-xs font-medium bg-accent/50">
                              {group.name}
                              <motion.div
                                animate={{ rotate: openCollapsible === group.name ? 180 : 0 }}
                                transition={springConfig}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </motion.div>
                            </CollapsibleTrigger>
                            <motion.div
                              initial={false}
                              animate={{
                                backgroundColor: openCollapsible === group.name
                                  ? "hsl(var(--accent) / 0.5)"
                                  : "rgba(0,0,0,0)"
                              }}
                              transition={{ duration: 0.2 }}
                              className="rounded-xl overflow-hidden"
                              layout
                            >
                              <CollapsibleContent className="data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up">
                                <div className="px-4 py-2 space-y-2">
                                  {group.items.map((item) => (
                                    <div
                                      key={item}
                                      className="flex items-center space-x-2"
                                    >
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex w-full justify-start gap-2 hover:bg-transparent"
                                        onClick={() => handleFilterSelect(group.name, item)}
                                      >
                                        <motion.div
                                          className={cn(
                                            "w-4 h-4 border rounded flex items-center justify-center",
                                            selectedFilters[group.name]?.includes(item)
                                              ? "bg-black border-black"
                                              : "border-gray-300"
                                          )}
                                          whileTap={{ scale: 0.9 }}
                                        >
                                          {selectedFilters[group.name]?.includes(item) && (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              transition={springConfig}
                                            >
                                              <Check className="h-2 w-2 text-white stroke-[4]" />
                                            </motion.div>
                                          )}
                                        </motion.div>
                                        {item}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </motion.div>
                          </motion.div>
                        </Collapsible>
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4 border-t bg-background/80 backdrop-blur-sm">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={clearFilters}
                      size="sm"
                      className="rounded-full hover:bg-accent/50"
                    >
                      Clear Filters
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full"
                      disabled={!hasSelectedFilters}
                      variant={hasSelectedFilters ? "default" : "secondary"}
                      onClick={() => {
                        // Apply filters logic here
                        console.log("Filters applied:", selectedFilters);
                      }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </motion.div>
              </LayoutGroup>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white shadow-sm rounded-full">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {date?.from ? (
                        date.to ? 
                          `${date.from instanceof Date ? date.from.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          }) : ''} - ${date.to instanceof Date ? date.to.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          }) : ''}` :
                          date.from instanceof Date ? date.from.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          }) : ''
                      ) : "Select Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      pagedNavigation
                      showOutsideDays={false}
                      className="rounded-lg border shadow-md p-2"
                      classNames={{
                          months: "gap-8",
                          month:"relative first-of-type:before:hidden before:absolute max-sm:before:inset-x-2 max-sm:before:h-px max-sm:before:-top-2 sm:before:inset-y-2 sm:before:w-px before:bg-border sm:before:-left-4",
                             }}
                    />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" className="bg-white shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Stat Cards - Now using 5 cards instead of 6 (no ROI card) */}
        <Card className="col-span-12 md:col-span-6 lg:col-span-3 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold mt-2">{team?.members.length}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-6 lg:col-span-3 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold mt-2">{apiResponse?.viewsCount}</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-purple-600 " />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-4 lg:col-span-3 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold mt-2">{dataleads.length}</p>
              </div>
              <div className="bg-indigo-100  p-2 rounded-full">
                <LinkIcon className="h-5 w-5 text-indigo-600 " />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-4 lg:col-span-3 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total New Connections</p>
                <p className="text-2xl font-bold mt-2">{apiResponse?.connectsCount}</p>
              </div>
              <div className="bg-pink-100  p-2 rounded-full">
                <CreditCard className="h-5 w-5 text-pink-600 " />
              </div>
            </div>
          </CardContent>
        </Card>

        

        {/* Main chart - Performance Comparison */}
        <Card className="col-span-12 lg:col-span-8 shadow-sm">
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <CardTitle>Performance Comparison</CardTitle>
            <div className="flex items-center text-sm space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span>Views</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-200 mr-2"></div>
                <span>Saves</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px]">
              <ClientOnly>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={apiResponse?.viewsData || []}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4361ee" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorSaves" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a5b4fc" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#a5b4fc" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      domain={[0, (dataMax: number) => Math.ceil(dataMax * 2)]}
                      allowDataOverflow={false}
                      tickCount={5}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${Math.floor(value / 1000000)}M`;
                        if (value >= 1000) return `${Math.floor(value / 1000)}K`;
                        return Math.floor(value).toString();
                      }}
                    />
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="saves" stroke="#a5b4fc" fillOpacity={1} fill="url(#colorSaves)" />
                    <Area type="monotone" dataKey="views" stroke="#4361ee" fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads Card */}
        <Card className="col-span-12 lg:col-span-4 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-black/80">Recent Leads Captured</CardTitle>
              <Link href="/leads">
                <Button variant="ghost" size="sm" className="h-7 text-black/50 hover:text-black/70 p-0">
                  View all &gt;
                </Button>
              </Link>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
            <div className="max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {dataleads.length > 0 && dataleads.map((lead, index) => (
                <div key={index} className="flex items-center justify-between py-2.5 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${
                      lead.title[0].toLowerCase() === 's' ? 'bg-pink-200 text-pink-600' :
                      lead.title[0].toLowerCase() === 'k' ? 'bg-purple-200 text-purple-600' :
                      lead.title[0].toLowerCase() === 'i' ? 'bg-blue-200 text-blue-600' :
                      lead.title[0].toLowerCase() === 'b' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                    } flex items-center justify-center text-sm uppercase font-medium`}>
                      {lead.title[0].toLowerCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{lead.title}</span>
                      <span className="text-xs text-gray-500">connected with {lead.user.name}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{lead.createdAt}</span>
                </div>
              ))}
              {dataleads.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col">
                      <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                        <Target className="w-8 h-8 text-black" />
                      </div>
                      <span className="text-sm text-gray-500">No data available
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Leads Overtime Chart (Replacing Views & Leads Comparison) */}
        <Card className="col-span-12 lg:col-span-8 shadow-sm">
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <CardTitle>Leads Overtime</CardTitle>
            <div className="flex overflow-x-auto pb-2 no-scrollbar" style={{ maxWidth: '60%' }}>
 
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px]">
              <ClientOnly>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { date: "Feb 25", "Business Card": 10},
                      { date: "Feb 28", "Business Card": 15},
                      { date: "Mar 03", "Business Card": 12 },
                      { date: "Mar 07", "Business Card": 18 },
                      { date: "Mar 11", "Business Card": 20},
                      { date: "Mar 15", "Business Card": 25 },
                      { date: "Mar 19", "Business Card": 22 },
                      { date: "Mar 24", "Business Card": 28 },
                    ]}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      padding={{ left: 10, right: 10 }} 
                    />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="Business Card"
                      stroke="#4361ee"
                      strokeWidth={2}
                      dot={{ stroke: '#4361ee', strokeWidth: 2, r: 4, fill: 'white' }}
                      activeDot={{ stroke: '#4361ee', strokeWidth: 2, r: 6, fill: 'white' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Popl User to Popl User"
                      stroke="#3a0ca3"
                      strokeWidth={2}
                      dot={{ stroke: '#3a0ca3', strokeWidth: 2, r: 4, fill: 'white' }}
                      activeDot={{ stroke: '#3a0ca3', strokeWidth: 2, r: 6, fill: 'white' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Lead Capture Form"
                      stroke="#7209b7"
                      strokeWidth={2}
                      dot={{ stroke: '#7209b7', strokeWidth: 2, r: 4, fill: 'white' }}
                      activeDot={{ stroke: '#7209b7', strokeWidth: 2, r: 6, fill: 'white' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="CSV"
                      stroke="#f72585"
                      strokeWidth={2}
                      dot={{ stroke: '#f72585', strokeWidth: 2, r: 4, fill: 'white' }}
                      activeDot={{ stroke: '#f72585', strokeWidth: 2, r: 6, fill: 'white' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Manually Added"
                      stroke="#4cc9f0"
                      strokeWidth={2}
                      dot={{ stroke: '#4cc9f0', strokeWidth: 2, r: 4, fill: 'white' }}
                      activeDot={{ stroke: '#4cc9f0', strokeWidth: 2, r: 6, fill: 'white' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Event Badge"
                      stroke="#fb8500"
                      strokeWidth={2}
                      dot={{ stroke: '#fb8500', strokeWidth: 2, r: 4, fill: 'white' }}
                      activeDot={{ stroke: '#fb8500', strokeWidth: 2, r: 6, fill: 'white' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </CardContent>
        </Card>

        {/* Distribution charts - Moved to be next to Leads Overtime */}
        <div className="col-span-12 lg:col-span-4 grid grid-cols-1 gap-4">
          {/* View type Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle>View Type</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[135px]">
                <ClientOnly>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={apiResponse?.totalviewstype}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        stroke="none"
                        dataKey="value"
                      >
                        {apiResponse?.totalviewstype.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ClientOnly>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {apiResponse?.totalviewstype.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-xs">{entry.name} {entry.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lead Status Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle>Lead Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[135px]">
                <ClientOnly>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        stroke="none"
                        dataKey="value"
                      >
                        {leadStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ClientOnly>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {leadStatusData.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}></div>
                    <span className="text-xs">{entry.name} {entry.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Section */}
        <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Data By Member and Template Link Taps */}
          <div className="space-y-4">
            {/* Data By Member Table */}
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-medium">Data By Member</CardTitle>
                  <div className="rounded-full bg-gray-100  p-1">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5 1.75C4.32436 1.75 1.75 4.32436 1.75 7.5C1.75 10.6756 4.32436 13.25 7.5 13.25C10.6756 13.25 13.25 10.6756 13.25 7.5C13.25 4.32436 10.6756 1.75 7.5 1.75ZM2.75 7.5C2.75 4.87665 4.87665 2.75 7.5 2.75C10.1234 2.75 12.25 4.87665 12.25 7.5C12.25 10.1234 10.1234 12.25 7.5 12.25C4.87665 12.25 2.75 10.1234 2.75 7.5ZM7 6.5V10.5H8V6.5H7ZM7 4.5V5.5H8V4.5H7Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-sm text-gray-500 hover:text-gray-900">
                  View more <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-0">
                      <TableHead className="font-medium bg-white">Name</TableHead>
                      <TableHead className="text-right font-medium bg-white">Views</TableHead>
                      <TableHead className="text-right font-medium bg-white">Taps</TableHead>
                      <TableHead className="text-right font-medium bg-white">Leads ↓</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiResponse?.topPerformers.map((member, index) => (
                      <TableRow 
                        key={member.name} 
                        className={`rounded-xl ${
                          index % 2 === 0 ? 'bg-[#F7F7F7]' : 'bg-[#FFF]'
                        } border-0`}
                      >
                        <TableCell className="flex items-center gap-3 py-3">
                          <Avatar className="h-8 w-8 border border-gray-200">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-gray-100 text-gray-600">{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </TableCell>
                        <TableCell className="text-right">{member.views}</TableCell>
                        <TableCell className="text-right">{member.taps}</TableCell>
                        <TableCell className="text-right">{member.leads}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Template Link Taps Table */}

          </div>

          {/* Right Column - Link Taps */}
          <Card className="shadow-sm h-[70%]">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-medium">Link Taps</CardTitle>
                <div className="rounded-full bg-gray-100  p-1">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 1.75C4.32436 1.75 1.75 4.32436 1.75 7.5C1.75 10.6756 4.32436 13.25 7.5 13.25C10.6756 13.25 13.25 10.6756 13.25 7.5C13.25 4.32436 10.6756 1.75 7.5 1.75ZM2.75 7.5C2.75 4.87665 4.87665 2.75 7.5 2.75C10.1234 2.75 12.25 4.87665 12.25 7.5C12.25 10.1234 10.1234 12.25 7.5 12.25C4.87665 12.25 2.75 10.1234 2.75 7.5ZM7 6.5V10.5H8V6.5H7ZM7 4.5V5.5H8V4.5H7Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-sm text-gray-500 hover:text-gray-900">
                View more <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-0">
                    <TableHead className="font-medium bg-white">Link</TableHead>
                    <TableHead className="font-medium bg-white">User</TableHead>
                    <TableHead className="font-medium bg-white">Card Name</TableHead>
                    <TableHead className="text-right font-medium bg-white">Taps</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiResponse?.topTappedLinks.map((item, index) => (
                    <TableRow 
                      key={item.cardName} 
                      className={`rounded-xl ${
                        index % 2 === 0 ? 'bg-[#F7F7F7]' : 'bg-[#FFF]'
                      } border-0`}
                    >
                      <TableCell className="flex items-center gap-3 py-3">
                        <Avatar className="h-8 w-8 border border-gray-200 rounded-lg">
                          <AvatarImage src={item.avatar} />
                          <AvatarFallback className="bg-gray-100 text-gray-600 rounded-lg">{item.cardName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{item.link}</span>
                      </TableCell>
                      <TableCell>{item.pUser}</TableCell>
                      <TableCell>{item.cardName}</TableCell>
                      <TableCell className="text-right">{item.taps}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Distribution charts */}
        

      </div>
    </div>
  );
}