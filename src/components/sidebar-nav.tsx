"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUserStore } from "@/store/user-store";
import { useTeamStore } from "@/store/team-store";
import { RiTeamLine } from "react-icons/ri";
import {
  LayoutDashboard,
  Users,
  Palette,
  Link as LinkIcon,
  BarChart,
  Wrench,
  Mail,
  Image as ImageIcon,
  FormInput,
  ScanLine,
  Mail as MailIcon,
  QrCode,
  Plus,
  LayoutDashboard as WidgetIcon,
  Bell,
  GitMerge,
  HelpCircle,
  FileText,
  MessageSquare,
  Lightbulb,
  PlayCircle,
  HelpCircle as FaqIcon,
  Settings,
  Building2,
  CreditCard,
  UserCircle,
  BadgePlus,
  Bell as NotificationIcon,
  ChevronDown,
  Share,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { WhatsNewDialog, useUpdateStore } from "./whats-new-dialog";

export function SidebarNav() {
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const unreadCount = useUpdateStore((state) => state.getUnreadCount());
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const { user, fetchUser, isLoading: isUserLoading } = useUserStore();
  const { teams, fetchTeam, setTeam, isLoading: isTeamLoading } = useTeamStore();
  const team = user?.team ? teams[user.team] : null;

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
  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev) => {
      const newState = { ...prev };
      // Close all other menus
      Object.keys(newState).forEach((key) => {
        if (key !== menuId) newState[key] = false;
      });
      // Toggle the clicked menu
      newState[menuId] = !prev[menuId];
      return newState;
    });
  };

  // Check if the current path is within a specific section
  const isInSection = (section: string) => pathname.startsWith(`/${section}`);

  // Effect to handle menu state based on pathname
  useEffect(() => {
    const section = ["team", "toolkit", "support", "settings"].find((s) =>
      isInSection(s)
    );
    if (section) {
      setOpenMenus((prev) => ({ ...prev, [section]: true }));
    } else {
      setOpenMenus({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <Sidebar className="border-r border-sidebar-border/50 flex flex-col bg-sidebar shadow-[var(--sidebar-shadow)]">
        <SidebarHeader className="border-b border-sidebar-border/50">
          <div className="flex justify-center items-center gap-2 px-3 h-[105px]">
          {team?.teamSettings?.logo ? (
              <Image
                src={team.teamSettings.logo}
                alt="Logo"
                width={128}
                height={128}
                className="rounded-lg"
              />
            ) : null}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4 py-2 space-y-1.5">
          <SidebarMenu className="space-y-1.5">
            {/* Home */}
            <SidebarMenuItem>
              <Link
                href="/"
                onClick={() => isMobile && setOpenMobile(false)}
                className="block"
              >
                <SidebarMenuButton
                  className={`transition-all duration-200 ease-in-out rounded-md py-1.5 text-[11.5px] font-medium
                    ${
                      pathname === "/"
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold hover:bg-sidebar-accent"
                        : "hover:bg-sidebar-accent/50"
                    }`}
                >
                  <LayoutDashboard
                    className={`h-4 w-4 transition-colors ${
                      pathname === "/" ? "text-black" : ""
                    }`}
                  />
                  <span>Home</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            {/* Team */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={(e) => {
                  toggleMenu("team");
                  if (!openMenus["team"]) {
                    router.push("/team/members");
                  }
                }}
                className={`transition-all duration-200 ease-in-out rounded-md py-1.5 text-[11.5px] font-medium
                  ${isInSection("team") ? "text-black font-semibold" : ""}`}
              >
                <RiTeamLine
                  className={`h-4 w-4 transition-colors ${
                    isInSection("team") ? "text-black" : ""
                  }`}
                />
                <span>Team</span>
                <ChevronDown
                  className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out ${
                    openMenus["team"] ? "rotate-180" : ""
                  }`}
                />
              </SidebarMenuButton>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openMenus["team"] ? "max-h-96" : "max-h-0"
                }`}
              >
                <SidebarMenuSub className="animate-in slide-in-from-left-2 duration-300 space-y-1">
                  <SidebarMenuSubItem>
                    <div onClick={() => router.push("/team/members")}>
                      <SidebarMenuSubButton
                        className={`transition-all duration-200 rounded-md hover:bg-sidebar-accent/30 hover:translate-x-0.5 text-[11.5px] font-medium cursor-pointer
                          ${
                            pathname === "/team/members"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                              : ""
                          }`}
                      >
                        Members
                      </SidebarMenuSubButton>
                    </div>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <div onClick={() => router.push("/team/subteams")}>
                      <SidebarMenuSubButton
                        className={`transition-all duration-200 rounded-md hover:bg-sidebar-accent/30 hover:translate-x-0.5 text-[11.5px] font-medium cursor-pointer
                          ${
                            pathname === "/team/subteams"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                              : ""
                          }`}
                      >
                        Subteams
                      </SidebarMenuSubButton>
                    </div>
                  </SidebarMenuSubItem>
                  
                  {user?.roles?.teamRole !== "member" && (
                    <SidebarMenuSubItem>
                      <div onClick={() => router.push("/team/add-members")}>
                        <SidebarMenuSubButton
                          className={`transition-all duration-200 rounded-md hover:bg-sidebar-accent/30 hover:translate-x-0.5 text-[11.5px] font-medium cursor-pointer
                            ${
                              pathname === "/team/add-members"
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                : ""
                            }`}
                        >
                          Add Members
                        </SidebarMenuSubButton>
                      </div>
                    </SidebarMenuSubItem>
                  )}
                </SidebarMenuSub>
              </div>
            </SidebarMenuItem>

            {/* Themes */}
            <SidebarMenuItem>
              <Link
                href="/themes"
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <SidebarMenuButton
                  className={`transition-all duration-200 ease-in-out rounded-md py-1.5 text-[11.5px] font-medium
                  ${
                    pathname === "/themes"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold hover:bg-sidebar-accent"
                      : "hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Palette
                    className={`h-4 w-4 transition-colors ${
                      pathname === "/themes" ? "text-black" : ""
                    }`}
                  />
                  <span>Themes</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            {/* Leads */}
            <SidebarMenuItem>
              <Link
                href="/leads"
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <SidebarMenuButton
                  className={`transition-all duration-200 ease-in-out rounded-md py-1.5 text-[11.5px] font-medium
                  ${
                    pathname === "/leads"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold hover:bg-sidebar-accent"
                      : "hover:bg-sidebar-accent/50"
                  }`}
                >
                  <LinkIcon
                    className={`h-4 w-4 transition-colors ${
                      pathname === "/leads" ? "text-black" : ""
                    }`}
                  />
                  <span>Leads</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            {/* Analytics */}
            <SidebarMenuItem>
              <Link
                href="/analytics"
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <SidebarMenuButton
                  className={`transition-all duration-200 ease-in-out rounded-md py-1.5 text-[11.5px] font-medium
                  ${
                    pathname === "/analytics"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold hover:bg-sidebar-accent"
                      : "hover:bg-sidebar-accent/50"
                  }`}
                >
                  <BarChart
                    className={`h-4 w-4 transition-colors ${
                      pathname === "/analytics" ? "text-black" : ""
                    }`}
                  />
                  <span>Analytics</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            {/* Toolkit */}
            {user?.roles?.teamRole !== "member" && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={(e) => {
                    toggleMenu("toolkit");
                    if (!openMenus["toolkit"]) {
                      router.push("/toolkit/mail-signature");
                    }
                  }}
                  className={`transition-all duration-200 ease-in-out rounded-md py-1.5 text-[11.5px] font-medium
                    ${isInSection("toolkit") ? "text-black font-semibold" : ""}`}
                >
                  <Wrench
                    className={`h-4 w-4 transition-colors ${
                      isInSection("toolkit") ? "text-black" : ""
                    }`}
                  />
                  <span>Networking toolkit (Trowas Toolkit)</span>
                  <ChevronDown
                    className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out ${
                      openMenus["toolkit"] ? "rotate-180" : ""
                    }`}
                  />
                </SidebarMenuButton>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openMenus["toolkit"] ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <SidebarMenuSub className="animate-in slide-in-from-left-2 duration-300 space-y-1">
                    <SidebarMenuSubItem>
                      <div onClick={() => router.push("/toolkit/mail-signature")}>
                        <SidebarMenuSubButton
                          className={`transition-all duration-200 rounded-md hover:bg-sidebar-accent/30 hover:translate-x-0.5 text-[11.5px] font-medium cursor-pointer
                            ${
                              pathname === "/toolkit/mail-signature"
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                : ""
                            }`}
                        >
                          Mail Signature
                        </SidebarMenuSubButton>
                      </div>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <div
                        onClick={() => router.push("/toolkit/virtual-background")}
                      >
                        <SidebarMenuSubButton
                          className={`transition-all duration-200 rounded-md hover:bg-sidebar-accent/30 hover:translate-x-0.5 text-[11.5px] font-medium cursor-pointer
                            ${
                              pathname === "/toolkit/virtual-background"
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                : ""
                            }`}
                        >
                          Virtual Background
                        </SidebarMenuSubButton>
                      </div>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <div onClick={() => router.push("/toolkit/leads-form")}>
                        <SidebarMenuSubButton
                          className={`transition-all duration-200 rounded-md hover:bg-sidebar-accent/30 hover:translate-x-0.5 text-[11.5px] font-medium cursor-pointer
                            ${
                              pathname === "/toolkit/leads-form"
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                : ""
                            }`}
                        >
                          Leads Form
                        </SidebarMenuSubButton>
                      </div>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </div>
              </SidebarMenuItem>
            )}

            {/* Integrations */}
            <SidebarMenuItem>
              <Link
                href="/integrations"
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <SidebarMenuButton
                  className={`transition-all duration-200 ease-in-out rounded-md py-1.5 text-[11.5px] font-medium
                  ${
                    pathname === "/integrations"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold hover:bg-sidebar-accent"
                      : "hover:bg-sidebar-accent/50"
                  }`}
                >
                  <GitMerge
                    className={`h-4 w-4 transition-colors ${
                      pathname === "/integrations" ? "text-black" : ""
                    }`}
                  />
                  <span>Integrations</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            {/* Support */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={(e) => {
                  toggleMenu("support");
                  if (!openMenus["support"]) {
                    router.push("/support/docs");
                  }
                }}
                className={`transition-all duration-200 ease-in-out rounded-md py-1.5 text-[11.5px] font-medium
                  ${isInSection("support") ? "text-black font-semibold" : ""}`}
              >
                <HelpCircle
                  className={`h-4 w-4 transition-colors ${
                    isInSection("support") ? "text-black" : ""
                  }`}
                />
                <span>Support</span>
                <ChevronDown
                  className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out ${
                    openMenus["support"] ? "rotate-180" : ""
                  }`}
                />
              </SidebarMenuButton>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openMenus["support"] ? "max-h-96" : "max-h-0"
                }`}
              >
                <SidebarMenuSub className="animate-in slide-in-from-left-2 duration-300 space-y-1">
                  <SidebarMenuSubItem>
                    <div onClick={() => router.push("/support/docs")}>
                      <SidebarMenuSubButton
                        className={`transition-all duration-200 rounded-md hover:bg-sidebar-accent/30 hover:translate-x-0.5 text-[11.5px] font-medium cursor-pointer
                          ${
                            pathname === "/support/docs"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                              : ""
                          }`}
                      >
                        Docs
                      </SidebarMenuSubButton>
                    </div>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <div onClick={() => router.push("/support/contact")}>
                      <SidebarMenuSubButton
                        className={`transition-all duration-200 rounded-md hover:bg-sidebar-accent/30 hover:translate-x-0.5 text-[11.5px] font-medium cursor-pointer
                          ${
                            pathname === "/support/contact"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                              : ""
                          }`}
                      >
                        Contact Us
                      </SidebarMenuSubButton>
                    </div>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <div onClick={() => router.push("/support/suggestions")}>
                      <SidebarMenuSubButton
                        className={`transition-all duration-200 rounded-md hover:bg-sidebar-accent/30 hover:translate-x-0.5 text-[11.5px] font-medium cursor-pointer
                          ${
                            pathname === "/support/suggestions"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                              : ""
                          }`}
                      >
                        Request Suggestion
                      </SidebarMenuSubButton>
                    </div>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </div>
            </SidebarMenuItem>

            {/* Settings */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={(e) => {
                  toggleMenu("settings");
                  if (!openMenus["settings"]) {
                    router.push("/settings/teams");
                  }
                }}
                className={`transition-all duration-200 ease-in-out rounded-md py-1.5 text-[11.5px] font-medium
                  ${isInSection("settings") ? "text-black font-semibold" : ""}`}
              >
                <Settings
                  className={`h-4 w-4 transition-colors ${
                    isInSection("settings") ? "text-black" : ""
                  }`}
                />
                <span>General Settings</span>
                <ChevronDown
                  className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out ${
                    openMenus["settings"] ? "rotate-180" : ""
                  }`}
                />
              </SidebarMenuButton>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openMenus["settings"] ? "max-h-96" : "max-h-0"
                }`}
              >
                <SidebarMenuSub className="animate-in slide-in-from-left-2 duration-300 space-y-1">
                  <SidebarMenuSubItem>
                    <div onClick={() => router.push("/settings/teams")}>
                      <SidebarMenuSubButton
                        className={`transition-all duration-200 rounded-md hover:bg-sidebar-accent/30 hover:translate-x-0.5 text-[11.5px] font-medium cursor-pointer
                          ${
                            pathname === "/settings/teams"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                              : ""
                          }`}
                      >
                        Teams Settings
                      </SidebarMenuSubButton>
                    </div>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <div onClick={() => router.push("/settings/mySubs")}>
                      <SidebarMenuSubButton
                        className={`transition-all duration-200 rounded-md hover:bg-sidebar-accent/30 hover:translate-x-0.5 text-[11.5px] font-medium cursor-pointer
                          ${
                            pathname === "/settings/mySubs"
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                              : ""
                          }`}
                      >
                        My Subscription
                      </SidebarMenuSubButton>
                    </div>
                  </SidebarMenuSubItem>
                  
                </SidebarMenuSub>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <div className="mt-auto">
          {/* Updates Button with Badge */}
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between px-3 py-2 transition-all duration-200 hover:bg-sidebar-accent/50 hover:translate-x-0.5 group"
            onClick={() => setIsWhatsNewOpen(true)}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 transition-colors" />
              <span className="text-[11.5px] font-medium">
                What&apos;s News
              </span>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium animate-in slide-in-from-left-1">
                {unreadCount}
              </div>
            )}
          </Button>

          {/* Refer Team Button */}
          

          {/* User Panel */}
          <div className="px-3 py-2 transition-all duration-200 hover:bg-sidebar-accent/20 cursor-pointer group">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Image
                  src={user?.profileImage || "/defaultpp.png"}
                  alt="User Avatar"
                  width={28}
                  height={28}
                  className="rounded-full ring-1 ring-sidebar-border/50 transition-all duration-200 group-hover:ring-2 group-hover:ring-sidebar-primary/50"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-sidebar-background transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium transition-colors">
                  {user?.name || ""}
                </span>
                <Link
                  href="/account"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 group-hover:text-sidebar-primary"
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  Manage Account
                </Link>
              </div>
              
            </div>
          </div>
        </div>
      </Sidebar>

      <WhatsNewDialog open={isWhatsNewOpen} onOpenChange={setIsWhatsNewOpen} />
    </>
  );
}
