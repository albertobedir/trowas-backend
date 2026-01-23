"use client"
import Image from "next/image";
import { Users, Eye, Save, Unplug, Target, Activity, BarChart, UserPlus, Mail, ArrowRight, Info, ChevronRight, CreditCard, Plus, ChevronLeft, Bell } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react';
import { AiFillSignal } from "react-icons/ai";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BiDollarCircle } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { LuTrees } from "react-icons/lu";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Api } from "@/lib/api";
import { useUserStore } from "@/store/user-store";
import { useTeamStore } from "@/store/team-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { PasswordResetDialog } from "@/components/ui/password-reset-dialog";
import { toast } from "sonner";

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
// Performance comparison data
const comparisonData = [
  { name: "Jan", views: 100, saves: 300 },
  { name: "Feb", views: 0, saves: 400 },
  { name: "Mar", views: 0, saves: 450 },
  { name: "Apr", views: 0, saves: 550 },
  { name: "May", views: 0, saves: 700 },
  { name: "Jun", views: 0, saves: 800 },
];

// Dynamic client-only component wrapper
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div className="h-full w-full bg-gray-50 dark:bg-gray-800/20 animate-pulse rounded-md"></div>;
  }

  return <>{children}</>;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
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

export default function Home() {
  const isLoading = usePageLoading();
  const { user, fetchUser, isLoading: isUserLoading } = useUserStore();
  const [currentToolkitIndex, setCurrentToolkitIndex] = useState(0);
  const { teams, fetchTeam, setTeam, isLoading: isTeamLoading } = useTeamStore();
  const team = user?.team ? teams[user.team] : null;
  const toolkitContainerRef = useRef<HTMLDivElement>(null);
  const [dataleads, setdataleads] = useState<any[]>([]);
  const [apiResponse, setApiResponse] = useState<PerformanceData | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Password Reset Dialog states
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [passwordResetRequired, setPasswordResetRequired] = useState(false);

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

  // Şifre değiştirme gereksinimi kontrolü (burada koşulu daha sonra belirleyeceğiz)
  useEffect(() => {
    if (!user) return;

    // TODO: Şifre değiştirme koşullarını buraya ekleyeceğiz
    // Olası koşul örnekleri:
    
    // 1. İlk kez giriş yapan kullanıcılar için:
    // const isFirstLogin = !user.lastLoginDate || user.isFirstLogin === true;
    
    // 2. Belirli bir süre şifre değiştirilmemiş kullanıcılar için:
    // const passwordAge = new Date().getTime() - new Date(user.lastPasswordChange).getTime();
    // const isPasswordOld = passwordAge > (90 * 24 * 60 * 60 * 1000); // 90 gün
    
    // 3. Geçici şifre kullanıcıları için:
    // const hasTemporaryPassword = user.passwordType === 'temporary';
    
    // 4. Admin tarafından şifre sıfırlama talebi olan kullanıcılar için:
    // const requiresPasswordReset = user.forcePasswordReset === true;
    
    // 5. Güvenlik politikası gereği belirli roller için:
    // const isAdminRole = user.role === 'admin' || user.role === 'superadmin';
    // const needsStrongPassword = isAdminRole && !user.hasStrongPassword;

    // Şimdilik demo amaçlı her zaman false olarak ayarlanmış
    const shouldRequirePasswordReset = user?.isChangePass; 
    
    // Koşul true olduğunda dialogu açmak için:
    if (shouldRequirePasswordReset && !passwordResetRequired) {
      setPasswordResetRequired(true);
      setShowPasswordResetDialog(true);
    }
  }, [user, passwordResetRequired]);

  // Şifre değiştirme fonksiyonu
  const handlePasswordReset = async (newPassword: string): Promise<void> => {
    try {
      // TODO: API call yaparak şifreyi güncelleme
      await Api.post('/auth/password/reset', {
        password: newPassword,
        confirmPassword: newPassword,
        email: user?.email
      });
      
      toast.success("Şifre başarıyla güncellendi", {
        description: "Yeni şifreniz kaydedildi. Artık sistemi kullanmaya devam edebilirsiniz."
      });
      
      setShowPasswordResetDialog(false);
      setPasswordResetRequired(false);
    } catch (error: any) {
      toast.error("Şifre güncellenirken hata oluştu", {
        description: error?.response?.data?.message || "Lütfen tekrar deneyin."
      });
      throw error; // Dialog'un loading state'ini kapatmak için
    }
  };



  useEffect(() => {
    (async () => {
      if (!isUserLoading && user) {
        const leaddatares = await Api.get(`/leads/all?teamId=${user?.team}&page=1&size=100`);
        setdataleads(leaddatares?.data?.leads);
        const performansds = await Api.get(`/teams/${user?.team}/get-performance`);
        setApiResponse(performansds?.data.data);

      }

    })()
  }, [user,isUserLoading]);
  console.log(dataleads);
  const recentLeads = [
    { id: '123312312', connectedWith: 'Copy of ...', date: 'May 09, 2025', initial: '1' },
    { id: 'sfasfas', connectedWith: 'Copy of ...', date: 'May 09, 2025', initial: 's' },
    { id: 'klmk', connectedWith: 'Copy of ...', date: 'May 08, 2025', initial: 'k' },
    { id: '123213213123212asfa', connectedWith: 'Copy of ...', date: 'May 06, 2025', initial: 'i' },
    { id: '123213123', connectedWith: 'Copy of ...', date: 'May 03, 2025', initial: '1' },
    { id: 'Kalii', connectedWith: 'Copy of ...', date: 'May 03, 2025', initial: 'k' },
    { id: 'Berna Durmus', connectedWith: 'Copy of ...', date: 'May 02, 2025', initial: 'b' },
    { id: 'John Smith', connectedWith: 'Copy of ...', date: 'May 01, 2025', initial: 'j' },
    { id: 'Alex Brown', connectedWith: 'Copy of ...', date: 'Apr 30, 2025', initial: 'a' },
  ];


  const recommendations = [
    { id: 1, text: 'Finish the "Get Started with Popi" steps above', action: 'Finish Steps' },
    { id: 2, text: '1 member has never logged in to the Popi mobile app, invite them to login', action: 'Send Invites' },
    { id: 3, text: '2 unsynced leads from the last 90 days', action: 'Sync Leads' },
  ];

  const toolkitItems = [
    {
      icon: "/emailSignature.svg",
      title: "Email Signature",
      description: "Share your info in every email and make it easy for others to reach you.",
      buttonname: "Learn more",
      url: '/toolkit/mail-signature'
    },
    {
      icon: "/autoFollowUpFeature.svg",
      title: "Auto Follow-Up",
      description: "Automatically send follow-up messages to nurture your leads.",
      buttonname: "Learn more",
      url: '/toolkit/auto-follow-up'
    },
    {
      icon: "/virtualBackgrouns.jpg",
      title: "Virtual Background",
      description: "Use branded backgrounds in your video meetings for professional appearance.",
      buttonname: "Learn more",
      url: '/toolkit/virtual-background'
    },
    {
      icon: "/emailSignature.svg",
      title: "Connect Your CRM",
      description: "Integrate with your CRM to sync contacts and track opportunities.",
      buttonname: "Coming Soon",
      url: '#'
    },
    {
      icon: "addToWallet.svg",
      title: "Add To Wallet",
      description: "Make it easy for contacts to save your digital card to their wallet.",
      buttonname: "Coming Soon",
      url: '#'
    },
    {
      icon: "/aIBusinessCardScaner.svg",
      title: "AI Business Card Scanner",
      description: "Scan physical business cards and extract contact information.",
      buttonname: "Coming Soon",
      url: '#'
    }
  ];

  const scrollToolkit = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentToolkitIndex(prev => Math.max(0, prev - 1));
    } else {
      setCurrentToolkitIndex(prev => Math.min(toolkitItems.length - 4, prev + 1));
    }
  };

  useEffect(() => {
    if (toolkitContainerRef.current) {
      const scrollAmount = currentToolkitIndex * ((toolkitContainerRef.current as HTMLDivElement).scrollWidth / toolkitItems.length);
      toolkitContainerRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [currentToolkitIndex, toolkitItems.length]);

  if (isLoading) {
    return <PageSkeleton variant="dashboard" />;
  }
  console.log(apiResponse)
  return (
    <div className="p-6 pt-8 w-full mx-auto">
      {/* Header section with welcome and actions */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-medium text-black/85">Good Afternoon, {user?.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back to your dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="p-2 h-10 w-10 rounded-md border-black/20 hover:border-black/70 hover:bg-white transition-all duration-300 bg-white text-black">
                <Bell className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="p-4 border-b">
                <h3 className="font-medium">Notifications</h3>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {dataleads.length > 0 && dataleads.map((lead, index) => (
                  <div key={index} className="flex items-center justify-between py-2.5 px-4 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${lead.title[0].toLowerCase() === 's' ? 'bg-pink-200 text-pink-600' :
                        lead.title[0].toLowerCase() === 'k' ? 'bg-purple-200 text-purple-600' :
                          lead.title[0].toLowerCase() === 'i' ? 'bg-blue-200 text-blue-600' :
                            lead.title[0].toLowerCase() === 'b' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        } flex items-center justify-center text-sm uppercase font-medium`}>
                        {lead.title[0]}
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
                  <div className="flex items-center justify-center py-6">
                    <span className="text-sm text-gray-500">No data available</span>
                  </div>
                )}
              </div>
              <div className="p-2 border-t text-center">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </PopoverContent>
          </Popover>

        </div>
      </div>
      {/* Main grid layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Section */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Team Performance Section */}
          <Card className="shadow-sm overflow-hidden border-0 ring-1 ring-black/5">
            <CardHeader className="bg-white pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base text-black/80">Team Performance</CardTitle>
                  <span className="text-sm text-black/40">|</span>
                  <span className="text-sm text-black/40">Last 60 days</span>
                </div>
                <Button variant="ghost" onClick={() => { window.location.href = '/analytics' }} size="sm" className="text-blue-600 p-0 h-auto font-normal hover:bg-transparent hover:text-blue-700">
                  View all analytics <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-4 py-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-50 p-3 mb-3">
                  <Users className="w-7 h-7 text-green-500" />
                </div>
                <span className="text-xl font-bold">{team?.members.length}</span>
                <span className="text-sm text-gray-500">Total Users</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-50 p-3 mb-3">
                  <Eye className="w-7 h-7 text-blue-500" />
                </div>
                <span className="text-xl font-bold">{apiResponse?.viewsCount}</span>
                <span className="text-sm text-gray-500">Total Views</span>

              </div>

              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-50 p-3 mb-3">
                  <Save className="w-7 h-7 text-purple-500" />
                </div>
                <span className="text-xl font-bold">{apiResponse?.connectsCount}</span>
                <span className="text-sm text-gray-500">Total Saves</span>

              </div>

              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-teal-50 p-3 mb-3">
                  <Unplug className="w-7 h-7 text-teal-500" />
                </div>
                <span className="text-xl font-bold">{team?.teamPerformance.leadsCaptured}</span>
                <span className="text-sm text-gray-500">Total New Connections</span>

              </div>
            </CardContent>
          </Card>
          {/* Performance Comparison Chart (replacing Campaigns Section) */}
          <Card className="shadow-sm border-0  ring-1 ring-black/5">
            <CardHeader className="flex flex-row justify-between pb-2">
              <div>
                <CardTitle className="text-base text-black/80">Performance Comparison</CardTitle>
                <CardDescription>Views vs Saves performance</CardDescription>
              </div>
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
              <div className="h-[450px]">
                <ClientOnly>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={apiResponse?.viewsData || []}
                      margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4361ee" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorSaves" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a5b4fc" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#a5b4fc" stopOpacity={0.1} />
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
          {/* Recommendations Section */}
          {/* Expert Card */}

        </div>
        {/* Right Section */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Add Members Card */}
          <Card className="shadow-sm border-0 ring-1 ring-black/5">
            <CardContent className="p-6 flex flex-col items-center justify-center py-7">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-center mb-2">Add Members</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Grow your team by inviting new members
              </p>
              <Button onClick={() => window.location.href = '/team/add-members'} className="p-4 rounded-full" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add Members
              </Button>
            </CardContent>
          </Card>

          {/* Top Performers Card */}
          <Card className="shadow-sm border-0 ring-1 ring-black/5">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Top performers</h3>

              {/* Map Top Performers - Maximum 2 */}
              {(() => {
                // Define performer type
                interface Performer {
                  name: string;
                  views: number;
                  leads: number;
                  profilePicture: string;
                }

                // Group leads by user to calculate performance metrics
                const performanceByUser: Record<string, Performer> = {};

                dataleads.forEach(lead => {
                  if (lead.user && lead.user.name) {
                    const userName = lead.user.name as string;

                    if (!performanceByUser[userName]) {
                      performanceByUser[userName] = {
                        name: userName,
                        views: 0,
                        leads: 0,
                        profilePicture: (lead.user.profilePicture as string) || "/defaultpp.png"
                      };
                    }

                    performanceByUser[userName].leads += 1;
                    // Estimate views based on available data
                    performanceByUser[userName].views += (lead.views as number) || 20;
                  }
                });

                // Convert to array and sort by leads count
                const sortedPerformers: Performer[] = Object.values(performanceByUser)
                  .sort((a, b) => b.leads - a.leads || b.views - a.views)
                  .slice(0, 2); // Get top 2 performers

                // Default performers if we don't have enough data
                const defaultPerformers: Performer[] = [
                  {
                    name: "Faruk",
                    views: 62,
                    leads: 3,
                    profilePicture: "/defaultpp.png"
                  },
                  {
                    name: "Yılmaz Pala",
                    views: 0,
                    leads: 0,
                    profilePicture: "/defaultpp.png"
                  }
                ];

                // Use default performers if needed
                const performers = sortedPerformers.length > 0
                  ? sortedPerformers
                  : defaultPerformers;

                // If we only have one performer, add a default second one
                if (performers.length === 1) {
                  performers.push(defaultPerformers[1]);
                }

                return apiResponse?.topPerformers.slice(0, 2).map((performer, index) => (
                  <div key={index} className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          width={40}
                          height={40}
                          src={performer.avatar || "/defaultpp.png"}
                          alt={performer.name}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{performer.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Views: {performer.views}</span>
                          <span>Leads: {performer.leads}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                ));
              })()}

              {/* Environmental Impact Section */}
              <div className="bg-lime-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="">
                    <LuTrees className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-medium">Your team saved {apiResponse?.leadsCaptured} paper cards</p>
                    <p className="text-sm text-gray-500">and planted {Math.floor(((team?.members?.length ?? 0) * 1000) / 10000)} tree</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expert Card */}
          <Card className="shadow-sm overflow-hidden border-0 ring-1 ring-black/5">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-medium mb-2 text-lg">Become RollCard Teams Expert</h3>
              <p className="text-sm text-gray-500 mb-4">
                Provide maximum value to your team by discovering all the features that RollCard has to offer.
              </p>
              <Button className="rounded-full" variant="outline" size="sm">Watch Tutorials</Button>
            </div>
          </Card>

        </div>
        {/* Networking Toolkit - Full Width Section */}
        <div className="col-span-12">
          <Card className="shadow-sm border-0 ring-1 ring-black/5">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-black/80">Networking Toolkit</CardTitle>
                  <CardDescription>Tools to enhance your networking experience</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-6">
              <div className="flex items-center">
                <Button
                  onClick={() => scrollToolkit('left')}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full mr-2 shrink-0"
                  disabled={currentToolkitIndex === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="relative overflow-hidden flex-1">
                  <div
                    ref={toolkitContainerRef}
                    className="flex gap-5 overflow-x-hidden scroll-smooth"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {toolkitItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-[calc(25%-15px)] flex flex-col p-5 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      >
                        <div className="mb-3 flex justify-center">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center bg-blue-50">
                            <Image height={64} width={64} src={item.icon} alt={item.title} className="object-cover group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-center mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                        <p className="text-xs text-gray-500 text-center">{item.description}</p>
                        <div className="mt-auto pt-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={item.url}>
                            <Button variant="ghost" size="sm" className="text-blue-600 p-0">
                              {item.buttonname} <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => scrollToolkit('right')}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full ml-2 shrink-0"
                  disabled={currentToolkitIndex >= toolkitItems.length - 4}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <PasswordResetDialog
        isOpen={showPasswordResetDialog}
        onPasswordReset={handlePasswordReset}
        userEmail={user?.email}
      />

      {/* Demo Test Button - Geçici olarak eklendi */}
      
    </div>
  );
}

