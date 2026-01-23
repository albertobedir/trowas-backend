"use client";

import { LuUsers } from "react-icons/lu";
import { useEffect, useCallback } from 'react';
import { useTeamMembersStore } from '@/store/team-members-store';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { AdminRolesDialog } from "@/components/admin-roles-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, PlusCircle, SortAsc, Mail, FileSpreadsheet, Building2, Users2, Calendar, X, Send, FileText, Image as ImageIcon, Code, User2, Upload, Trash2, History, Share2, ChevronUp, ChevronDown, Search, MoreHorizontal, Lock, QrCode, CreditCard, Copy } from "lucide-react";
import { LayoutGrid, LayoutList } from "lucide-react";
import { useState } from "react";
import { Users, Target, Activity, BarChart, UserPlus2, UserPlus, Settings, HelpCircle, User, Plus, ArrowRight, Info, Car, Check } from "lucide-react";
import React, { JSX } from 'react';
import { AiFillSignal } from "react-icons/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BiDollarCircle } from "react-icons/bi";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TemplateSelectionDialog } from "@/components/ui/template-selection-dialog-member";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import Image from 'next/image';
import { TeamSelectorButton } from '@/components/ui/TeamSelectorButton';
import { useUserStore } from "@/store/user-store";
import { Api } from '@/lib/api';
import { log } from 'console';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { set } from 'mongoose';


const sortOptions = [
  { id: "newest", label: "Date Added (Newest -> Oldest)" },
  { id: "oldest", label: "Date Added (Oldest -> Newest)" },
  { id: "az", label: "Alphabetical (A -> Z)" },
  { id: "za", label: "Alphabetical (Z -> A)" }
];

const addMemberOptions = [
  {
    id: 'email',
    title: 'Add by Email',
    description: 'Invite members via email address',
    icon: Mail
  },
  {
    id: 'csv',
    title: 'Import via CSV',
    description: 'Bulk import members from spreadsheet',
    icon: FileSpreadsheet
  },
  {
    id: 'company',
    title: 'Create Company Pages',
    description: 'Set up organizational structure',
    icon: Building2
  },
  {
    id: 'microsoft',
    title: 'Sync with Microsoft AD',
    description: 'Connect to Azure Active Directory',
    icon: Users2
  },
  {
    id: 'eventbrite',
    title: 'Sync with Eventbrite',
    description: 'Import event attendees as members',
    icon: Calendar
  }
];



interface PopoverContentProps {
  open: boolean;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  username: string;
  profileImage: string;
  team: string;
  subTeam: string | null;
  template: string;
  roles: {
    teamRole: string;
    userRole: string;
  };
  permissions: {
    teamPermission: number;
    userPermission: string[];
  };
  email_verified: boolean | null;
  createdAt: string;
}


// Create a new component for the content that uses useSearchParams
function MembersContent() {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { members, fetchMembers, isLoading: isMembersLoading } = useTeamMembersStore();
  const { user, fetchUser, isLoading: isUserLoading } = useUserStore();
  const [isGridView, setIsGridView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof TeamMember | '', direction: 'ascending' | 'descending' | '' }>({ key: "", direction: "" });
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
  const [subteamlistData, setSubteamlistData] = useState<Array<{ _id: string, name: string, description: string, logo: string, members: string[] }>>([]);
  const [contentHeight, setContentHeight] = useState(508);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);

  const tableCardRef = React.useRef<HTMLDivElement>(null);
  const hasSelectedFilters = Object.values(selectedFilters).some(filters => filters.length > 0);
  const [isTemplateDialogOpen2, setIsTemplateDialogOpen] = useState(false);
  const [idfortempmem, setIdForTempMem] = useState<string>("");
  const [currentTemplateId, setCurrentTemplateId] = useState("template-3");




  useEffect(() => {
    if (!isUserLoading && user) {
      fetchMembers();
    }
  }, [fetchMembers, isUserLoading, user]);



  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [fetchUser, user]);
  useEffect(() => {
    const fetchSubteamlistData = async () => {
      if (!isUserLoading && user) {
        const response = await Api.get(`/subteam/get-all?teamId=${user.team}`);
        console.log("Subteam list response:", response);
        console.log("Members:", members);
        if (!response.data) {
          throw new Error("Failed to fetch subteam list");
        }
        // Assuming the response data is an array of subteams
        // You can set the state with the fetched data
        setSubteamlistData(response.data.subTeams);
      }
    };
    fetchSubteamlistData();
  }, [isUserLoading, user, members]);

  const handleTemp = (_id: string) => {
    setIdForTempMem(_id);
    setIsTemplateDialogOpen(true);
  };
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  interface MenuItem {
    icon: JSX.Element;
    label: string;
    variant: string;
    divider?: boolean;
    onClick: (memberId: string) => void;
    selectedItems?: string[];
  }

  const handleImageUpload = async (type: 'profilePicture' | 'companyLogo' | 'coverPhoto', memberId: string, selectedItems: string[], teamId: string | undefined) => {
    return new Promise<void>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.addEventListener('change', async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          const formData = new FormData();
          formData.append(type, file);
          formData.append('memberIds', JSON.stringify(selectedItems));

          const response = await Api.post(`/teams/${teamId}/members/change-photos`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data) {
            toast.success("Image updated successfully");
          } else {
            toast.error("Failed to update image");
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error("Error uploading image");
        }

        resolve();
      });

      // Trigger file input click
      input.click();
    });
  };

  const menuItems: MenuItem[] = [
    {
      icon: <Upload className="h-3.5 w-3.5 mr-2 transition-colors group-hover:text-blue-500" />,
      label: 'Set Profile Picture',
      variant: 'default',
      onClick: (memberId) => handleImageUpload('profilePicture', memberId, selectedItems, user?.team)
    },
    {
      icon: <Upload className="h-3.5 w-3.5 mr-2 transition-colors group-hover:text-blue-500" />,
      label: 'Set Cover Photo',
      variant: 'default',
      onClick: (memberId) => handleImageUpload('coverPhoto', memberId, selectedItems, user?.team),
      divider: true
    },
    {
      icon: <Upload className="h-3.5 w-3.5 mr-2 transition-colors group-hover:text-blue-500" />,
      label: 'Set Company Logo',
      variant: 'default',
      onClick: (memberId) => handleImageUpload('companyLogo', memberId, selectedItems, user?.team)
    }
  ];
  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({
      visible: true,
      message,
      type,
    });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };
  const handlepermClick = (itemid: string) => {
    if (user?.roles?.teamRole === 'member' && user?._id !== itemid) {
      showNotification("You don't have permission", 'error');
    } else {
      router.push(`/team/members/${itemid}?index=0`);
    }
  };
  const handleFilterSelect = (group: string, item: string) => {
    setSelectedFilters(prev => {
      const groupFilters = prev[group] || [];
      const newFilters = {
        ...prev,
        [group]: groupFilters.includes(item)
          ? groupFilters.filter(i => i !== item)
          : [...groupFilters, item]
      };
      return newFilters;
    });
  };
  const updateURLParameters = useCallback((filters: { [key: string]: string[] }) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.keys(filters).forEach(key => {
      if (filters[key]?.length > 0) {
        switch (key) {
          case "Member Status":
            params.set('status', filters[key].join(','));
            break;
          case "Subteams":
            params.set('subteams', filters[key].join(','));
            break;
          case "Templates":
            params.set('templates', filters[key].join(','));
            break;
        }
      } else {
        switch (key) {
          case "Member Status":
            params.delete('status');
            break;
          case "Subteams":
            params.delete('subteams');
            break;
          case "Templates":
            params.delete('templates');
            break;
        }
      }
    });

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(newUrl);
  }, [searchParams, pathname, router]);
  // Update URL when filters change
  useEffect(() => {
    if (Object.keys(selectedFilters).length > 0) {
      updateURLParameters(selectedFilters);
    }
  }, [selectedFilters, updateURLParameters]);

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlFilters: { [key: string]: string[] } = {};

    const status = searchParams.get('status');
    const subteams = searchParams.get('subteams');
    const templates = searchParams.get('templates');

    if (status) urlFilters["Member Status"] = status.split(',').filter(Boolean);
    if (subteams) urlFilters["Subteams"] = subteams.split(',').filter(Boolean);
    if (templates) urlFilters["Templates"] = templates.split(',').filter(Boolean);

    setSelectedFilters(urlFilters);
  }, [searchParams]);

  // Bu fonksiyonun bağımlılıklarını ekle

  const applyFilters = (members: TeamMember[]) => {
    if (!hasSelectedFilters) return members;

    return members.filter(member => {
      // Evaluate each filter group independently
      const statusMatch = !selectedFilters["Member Status"]?.length ||
        selectedFilters["Member Status"].some(filter =>
          filter.toLowerCase() === member.roles.teamRole.toLowerCase()
        );

      const subteamsMatch = !selectedFilters["Subteams"]?.length ||
        selectedFilters["Subteams"].some(subteamName => {
          const subteam = subteamlistData.find(st => st.name === subteamName);
          return subteam && subteam.members.includes(member._id);
        });

      const templateMatch = !selectedFilters["Templates"]?.length ||
        selectedFilters["Templates"].some(filter =>
          (member.template?.toLowerCase() || "no template") === filter.toLowerCase()
        );

      // Return true only if all applied filters match
      return statusMatch && subteamsMatch && templateMatch;
    });
  };

  const clearFilters = () => {
    setSelectedFilters({});
  };
  const handleCollapsibleChange = (isOpen: boolean, groupName: string) => {
    setOpenCollapsible(isOpen ? groupName : null);
    // Dynamic height calculation based on content
    const baseHeight = 508;
    const expandedHeight = baseHeight + (isOpen ? 160 : 0);
    setContentHeight(expandedHeight);
  };

  const clearSort = () => {
    setSelectedSort(null);
    setSortConfig({ key: "", direction: "" });
  };
  const [zort, setZort] = useState({
    _id: "12345",
    teamId: "12345",
    name: "Yilmaz",
    role: false,
    image: "/path/to/image.jpg",
  });
  const [showhandleedit, setshowHandleEdit] = useState(false);
  const handleEditAdminStatus = (itemId: string, itemusername: string, itemprofileimage: string, itemrole: string) => {
    if (!user?.team) {
      console.error("User team is not available");
      return;
    }

    if (itemrole === 'member') {
      setZort({
        _id: itemId,
        name: itemusername,
        teamId: user.team,
        role: false,
        image: itemprofileimage
      });
    }
    if (itemrole === 'manager') {
      setZort({
        _id: itemId,
        name: itemusername,
        teamId: user.team,
        role: true,
        image: itemprofileimage
      });
    }
    setshowHandleEdit(true);
  };
  const applySort = () => {
    // Sorting logic will be implemented here
    console.log("Applying sort:", selectedSort);
  };

  const springConfig = {
    type: "spring",
    stiffness: 300,
    damping: 30
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === members.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(members.map(item => item._id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const closeSelectionMenu = () => {
    setSelectedItems([]);
  };


  const filterGroups = [
    {
      name: "Member Status",
      items: ["Owner", "Manager", "Pending", "Member"]
    },
    {
      name: "Subteams",
      items: subteamlistData.map(subteam => subteam.name)
    },
    {
      name: "Templates",
      items: Array.from(new Set(members?.map(member => member.template || 'No Template').filter(Boolean)))
    },
    {
      name: "Assignments",
      items: ["Assigned", "Unassigned", "In Progress", "Completed"]
    },
    {
      name: "Accessory Activation",
      items: ["Active", "Inactive", "Pending Review", "Suspended"]
    }
  ];




  if (isMembersLoading || isUserLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      {notification.visible && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-md shadow-lg ${notification.type === "success" ? "bg-green-600" : "bg-red-600"
            } text-white font-medium transition-all duration-500 transform translate-y-0 opacity-100`}
        >
          {notification.type === "success" ? (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{notification.message}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <X className="h-4 w-4" />
              <span>{notification.message}</span>
            </div>
          )}
        </div>
      )}
      <div className="p-3">
        <div className="h-full w-full">
          <div className="mx-auto py-6 px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Members</h1>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-full">
                  <motion.div
                    className="relative flex items-center space-x-1 border rounded-full p-1 bg-white"
                    initial={false}
                  >
                    <motion.div
                      className="absolute inset-y-1 rounded-full bg-black z-0"
                      initial={false}
                      animate={{
                        x: isGridView ? "100%" : "0%",
                        width: "50%"
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35
                      }}
                    />
                    <motion.button
                      className="relative z-10 rounded-full px-3 py-1.5"
                      onClick={() => setIsGridView(false)}
                      animate={{
                        color: !isGridView ? "white" : "black"
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="flex items-center gap-2"
                        initial={false}
                        animate={{
                          scale: !isGridView ? 1 : 0.9,
                          opacity: !isGridView ? 1 : 0.7
                        }}
                      >
                        <LayoutList className="h-4 w-4" />
                        <span className="text-sm font-medium">List</span>
                      </motion.div>
                    </motion.button>
                    <motion.button
                      className="relative z-10 rounded-full px-3 py-1.5"
                      onClick={() => setIsGridView(true)}
                      animate={{
                        color: isGridView ? "white" : "black"
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="flex items-center gap-2"
                        initial={false}
                        animate={{
                          scale: isGridView ? 1 : 0.9,
                          opacity: isGridView ? 1 : 0.7
                        }}
                      >
                        <LayoutGrid className="h-4 w-4" />
                        <span className="text-sm font-medium">Grid</span>
                      </motion.div>
                    </motion.button>
                  </motion.div>

                  <div className="flex flex-1 md:flex-none items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full flex-1 md:flex-none">
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
                                  // Force re-render by triggering a state update
                                  setSearchTerm(prev => prev + '');
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
                        <Button variant="outline" size="sm" className="rounded-full flex-1 md:flex-none">
                          <SortAsc className="h-4 w-4 mr-2" />
                          Sort
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="rounded-xl w-[320px] p-4">
                        <motion.div
                          className="flex flex-col"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={springConfig}
                        >
                          <h4 className="text-sm font-medium mb-4 text-black/70">Sort by</h4>
                          <div className="space-y-3 mb-6">
                            {sortOptions.map((option) => (
                              <motion.div
                                key={option.id}
                                className="flex items-center space-x-2"
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex w-full justify-start gap-2 hover:bg-transparent"
                                  onClick={() => setSelectedSort(option.id)}
                                >
                                  <motion.div
                                    className={cn(
                                      "w-4 h-4 border rounded-full flex items-center justify-center",
                                      selectedSort === option.id
                                        ? "border-black"
                                        : "border-gray-300"
                                    )}
                                  >
                                    {selectedSort === option.id && (
                                      <motion.div
                                        className="w-2 h-2 bg-black rounded-full"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={springConfig}
                                      />
                                    )}
                                  </motion.div>
                                  {option.label}
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                          <div className="flex justify-between">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={clearSort}
                              size="sm"
                              className="rounded-full hover:bg-accent/50"
                            >
                              Clear Sort
                            </Button>                              <Button
                              type="button"
                              size="sm"
                              className="rounded-full"
                              disabled={!selectedSort}
                              variant={selectedSort ? "default" : "secondary"}
                              onClick={() => {
                                switch (selectedSort) {
                                  case 'newest':
                                    setSortConfig({ key: 'createdAt', direction: 'descending' });
                                    break;
                                  case 'oldest':
                                    setSortConfig({ key: 'createdAt', direction: 'ascending' });
                                    break;
                                  case 'az':
                                    setSortConfig({ key: 'name', direction: 'ascending' });
                                    break;
                                  case 'za':
                                    setSortConfig({ key: 'name', direction: 'descending' });
                                    break;
                                }
                              }}
                            >
                              Apply Sort
                            </Button>
                          </div>
                        </motion.div>
                      </PopoverContent>
                    </Popover>
                    {user?.roles?.teamRole !== 'member' && (
                      <Button
                        size="sm"
                        className="rounded-full flex-1 md:flex-none"
                        onClick={() => {
                          window.location.href = 'add-members';
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                    )}

                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="w-full rounded-full bg-white pl-10"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Card ref={tableCardRef} className="w-full border rounded-lg overflow-hidden">
                <ScrollArea className="w-full" style={{ maxWidth: '100%' }}>
                  <div className="p-3">
                    {!isGridView ? (
                      <div style={{ minWidth: '100%' }}>
                        <Table>
                          <TableHeader>
                            <TableRow className="h-[48px]">
                              <TableHead className="w-[300px]">
                                <div className="flex items-center gap-4">
                                  <Checkbox
                                    checked={selectedItems.length === members.length}
                                    onCheckedChange={toggleSelectAll}
                                    className="ml-4 data-[state=checked]:bg-black data-[state=checked]:border-black"
                                  />
                                  <span className="text-sm font-medium">Select All</span>
                                </div>
                              </TableHead>
                              <TableHead className='text-center' style={{ width: '40%' }}></TableHead>
                              {user?.roles?.teamRole !== 'member' && (
                                <>
                                  <TableHead style={{ width: '20%' }}>Template</TableHead>
                                  <TableHead style={{ width: '15%' }}>Subteam</TableHead>
                                </>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {applyFilters(members || [])
                              .filter(member => {
                                if (!searchTerm) return true;
                                const searchLower = searchTerm.toLowerCase();
                                return (
                                  member.name.toLowerCase().includes(searchLower) ||
                                  member.username.toLowerCase().includes(searchLower) ||
                                  member.email.toLowerCase().includes(searchLower)
                                );
                              })
                              .sort((a, b) => {
                                if (!sortConfig.key) return 0;
                                let valueA = a[sortConfig.key];
                                let valueB = b[sortConfig.key];

                                if (sortConfig.key === 'roles') {
                                  valueA = a.roles.teamRole;
                                  valueB = b.roles.teamRole;
                                }

                                valueA = typeof valueA === 'string' ? valueA.toLowerCase() : valueA;
                                valueB = typeof valueB === 'string' ? valueB.toLowerCase() : valueB;

                                if (!valueA || !valueB) return 0;
                                if (valueA < valueB) return sortConfig.direction === 'ascending' ? -1 : 1;
                                if (valueA > valueB) return sortConfig.direction === 'ascending' ? 1 : -1;
                                return 0;
                              }).map((item) => (
                                <motion.tr
                                  key={item._id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  className="h-[90px] group hover:bg-accent/50 transition-colors"
                                >
                                  <TableCell>
                                    <div className="flex items-center gap-4 ml-4">
                                      <Checkbox
                                        checked={selectedItems.includes(item._id)}
                                        onCheckedChange={() => toggleSelectItem(item._id)}
                                        className="data-[state=checked]:bg-black data-[state=checked]:border-black transition-all duration-200 group-hover:border-black"
                                      />
                                      <div
                                        onClick={() => handlepermClick(item._id)}
                                        className="flex items-center gap-4 cursor-pointer"
                                      >
                                        <motion.img
                                          whileHover={{ scale: 1.05 }}
                                          className="rounded-full"
                                          src={item.profileImage}
                                          width={56}
                                          height={56}
                                          alt={item.name}
                                        />
                                        <div>
                                          <div className="font-medium text-base">{item.name}</div>
                                          <span className="mt-1 text-sm text-muted-foreground">{item.username}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 rounded-full bg-[rgb(242,242,242)] mb-4 text-[#828282] font-semibold text-[10px]">
                                          {item.roles.teamRole.toUpperCase()}
                                        </div>
                                        {user?.roles?.teamRole === 'owner' && (
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" className="h-8 w-8 p-0 mb-4">
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem onClick={() => handleEditAdminStatus(item._id, item.name, item.profileImage, item.roles.teamRole)}>
                                                Edit Admin Status
                                              </DropdownMenuItem>

                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        )}
                                      </div>
                                    </div>

                                  </TableCell>

                                  <TableCell className="text-sm text-center text-muted-foreground">{item.email}</TableCell>
                                  {user?.roles?.teamRole !== 'member' && (
                                    <>
                                      <TableCell className="">
                                        <span
                                          className='rounded-full cursor-pointer text-[rgb(79,79,79)] font-semibold text-xs p-2 px-5 bg-[rgb(242,242,242)] text-center hover:bg-[rgb(230,230,230)] transition-colors'
                                          onClick={() => handleTemp(item._id)}
                                        >
                                          Assign Template
                                        </span>
                                      </TableCell>

                                      <TableCell className="text-right text-sm">
                                        <TeamSelectorButton
                                          avatarSrc="/babel.png"
                                          userd={item._id}
                                          subteams={subteamlistData.map(subteam => ({
                                            id: subteam._id,
                                            name: subteam.name,
                                            avatar: subteam.logo || "/defaultcompanylogo.png",
                                            members: subteam.members || []
                                          }))}
                                          onSelect={(selected) => console.log("Selected subteam IDs:", selected)}
                                        />
                                      </TableCell>
                                    </>
                                  )}
                                </motion.tr>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {applyFilters(members || [])
                          .filter(member => {
                            if (!searchTerm) return true;
                            const searchLower = searchTerm.toLowerCase();
                            return (
                              member.name.toLowerCase().includes(searchLower) ||
                              member.username.toLowerCase().includes(searchLower) ||
                              member.email.toLowerCase().includes(searchLower)
                            );
                          })
                          .sort((a, b) => {
                            if (!sortConfig.key) return 0;
                            let valueA = a[sortConfig.key];
                            let valueB = b[sortConfig.key];

                            if (sortConfig.key === 'roles') {
                              valueA = a.roles.teamRole;
                              valueB = b.roles.teamRole;
                            }

                            valueA = typeof valueA === 'string' ? valueA.toLowerCase() : valueA;
                            valueB = typeof valueB === 'string' ? valueB.toLowerCase() : valueB;

                            if (!valueA || !valueB) return 0;
                            if (valueA < valueB) return sortConfig.direction === 'ascending' ? -1 : 1;
                            if (valueA > valueB) return sortConfig.direction === 'ascending' ? 1 : -1;
                            return 0;
                          }).map((item) => (
                            <motion.div
                              key={item._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <Card className="overflow-hidden group relative">
                                <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600" />
                                <Link href={`/team/members/${item._id}`}>
                                  <div className="flex flex-col items-center -mt-12 relative px-6">
                                    <motion.img
                                      whileHover={{ scale: 1.05 }}
                                      className="rounded-full border-4 border-white w-24 h-24 object-cover"
                                      src={item.profileImage}
                                      width={96}
                                      height={96}
                                      alt={item.name}
                                    />
                                    <div className="mt-3 text-center">
                                      <h3 className="font-semibold text-lg">{item.name}</h3>
                                      <p className="text-sm text-muted-foreground mt-1">{item.username}</p>
                                      <p className="text-sm text-muted-foreground mt-1">{item.email}</p>
                                      {user?.roles?.teamRole !== 'member' && (
                                        <div className="mt-2">
                                          <span
                                            className="inline-block px-3 py-1 text-xs rounded-full bg-[rgb(242,242,242)] text-[rgb(79,79,79)] font-semibold cursor-pointer hover:bg-[rgb(230,230,230)] transition-colors"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              handleTemp(item._id);
                                            }}
                                          >
                                            Assign Template
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                                <div className="flex items-center gap-2 mt-4 mb-6 justify-center">
                                  {user?.roles?.teamRole !== 'member' && (
                                    <div className="px-4 py-1.5 rounded-full text-sm bg-[rgb(242,242,242)]">
                                      {item.subTeam}
                                    </div>
                                  )}
                                  <Button size="sm" variant="outline" className="rounded-full" asChild>
                                    <Link href={`/team/members/${item._id}`}>
                                      View Profile
                                    </Link>
                                  </Button>
                                </div>
                                <div className="absolute top-3 left-3">
                                  <Checkbox
                                    checked={selectedItems.includes(item._id)}
                                    onCheckedChange={() => toggleSelectItem(item._id)}
                                    className="data-[state=checked]:bg-black data-[state=checked]:border-black transition-all duration-200 group-hover:border-black"
                                  />
                                </div>
                                <div className="absolute top-3 right-3">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/10">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 py-7 rounded-lg px-2" align="end" alignOffset={-5} sideOffset={5}>
                                      <div className="flex flex-col gap-2 py-1">
                                        {menuItems.map((menuItem, index) => (
                                          <React.Fragment key={menuItem.label}>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="justify-start h-8 px-2 rounded-md"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                menuItem.onClick(item._id);
                                              }}
                                            >
                                              {menuItem.icon}
                                              <span className="text-sm">{menuItem.label}</span>
                                            </Button>
                                            {menuItem.divider && <Separator className="my-1" />}
                                          </React.Fragment>
                                        ))}
                                        <Separator className="my-1" />
                                        <Button variant="ghost" size="sm" className="justify-start h-8 px-2 rounded-md">
                                          <Lock className="h-3.5 w-3.5 mr-2" />
                                          <span className="text-sm">Lock Member</span>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="justify-start h-8 px-2 rounded-md">
                                          <QrCode className="h-3.5 w-3.5 mr-2" />
                                          <span className="text-sm">Download QR Code</span>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="justify-start h-8 px-2 rounded-md">
                                          <CreditCard className="h-3.5 w-3.5 mr-2" />
                                          <span className="text-sm">View Card</span>
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </Card>
                            </motion.div>
                          ))}
                      </div>
                    )}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </Card>

              <AnimatePresence>
                {selectedItems.length > 0 && (
                  <motion.div
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 60, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 h-[60px] bg-black text-white flex items-center overflow-x-auto overflow-y-hidden"
                    style={{
                      left: tableCardRef.current?.getBoundingClientRect().left ?? "calc(270px + 1.5rem)",
                      width: tableCardRef.current?.offsetWidth,
                      borderRadius: "12px 12px 0 0",
                      padding: "0 0.75rem"
                    }}
                  >
                    <div className="flex items-center w-full">
                      <div className="flex items-center gap-2 w-full">
                        <motion.span
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="text-xs text-white/70 whitespace-nowrap min-w-[70px] flex items-center justify-start pl-1"
                        >
                          {selectedItems.length} Selected
                        </motion.span>
                        <Separator orientation="vertical" className="h-6 bg-white/20" />
                        <div className="flex-1 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-[2px]">
                            <div className="flex items-center">
                              {/* Member Dropdown */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <motion.button
                                    className={cn(
                                      "h-9 px-3 text-sm font-medium text-white hover:text-white hover:bg-white/20 whitespace-nowrap transition-all duration-200 flex items-center gap-2 rounded-md"
                                    )}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    <User2 className="h-[15px] w-[15px]" />
                                    <span>Member</span>
                                    <ChevronDown className="h-2.5 w-2.5" />
                                  </motion.button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-56"
                                  sideOffset={6}
                                  align="start"
                                  alignOffset={-4}
                                >
                                  <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 30,
                                      mass: 0.8
                                    }}
                                    className="backdrop-blur-[2px] bg-white/95 border w-72 border-gray-100/20 shadow-lg rounded-lg overflow-hidden p-4"
                                  >
                                    <div className="flex flex-col gap-0.5">


                                      <Separator className="my-1 bg-gray-100/20" />
                                      <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 30 }}
                                        className="rounded-md overflow-hidden"
                                      >
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50/80 group px-3 py-1.5 h-8"
                                        >
                                          <Trash2 className="h-3.5 w-3.5 mr-2 transition-colors group-hover:text-red-500" />
                                          <span className="transition-colors group-hover:text-red-500 text-[13px]">Reset Password</span>
                                        </Button>
                                      </motion.div>
                                    </div>
                                  </motion.div>
                                </PopoverContent>
                              </Popover>

                              <Separator orientation="vertical" className="h-6 bg-white/20 mx-0.5" />

                              {/* Image Dropdown */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <motion.button
                                    className={cn(
                                      "h-9 px-3 text-sm font-medium text-white hover:text-white hover:bg-white/20 whitespace-nowrap transition-all duration-200 flex items-center gap-2 rounded-md"
                                    )}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    <ImageIcon className="h-[15px] w-[15px]" />
                                    <span>Image</span>
                                    <ChevronDown className="h-2.5 w-2.5" />
                                  </motion.button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-56"
                                  sideOffset={6}
                                  align="start"
                                  alignOffset={-4}
                                >
                                  <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 30,
                                      mass: 0.8
                                    }}
                                    className="backdrop-blur-[2px] bg-white/95 border border-gray-100/20 shadow-lg rounded-lg overflow-hidden p-1"
                                  >
                                    <div className="flex flex-col gap-0.5">
                                      {menuItems.map((item, index) => (
                                        <React.Fragment key={item.label}>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start h-8 px-2 rounded-md"
                                            onClick={() => item.onClick && item.onClick(item.label)}
                                          >
                                            {item.icon}
                                            <span className="text-sm">{item.label}</span>
                                          </Button>
                                          {item.divider && <Separator className="my-1" />}
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  </motion.div>
                                </PopoverContent>
                              </Popover>

                              <Separator orientation="vertical" className="h-6 bg-white/20 mx-0.5" />

                              {/* Popcode Dropdown */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <motion.button
                                    className={cn(
                                      "h-9 px-3 text-sm font-medium text-white hover:text-white hover:bg-white/20 whitespace-nowrap transition-all duration-200 flex items-center gap-2 rounded-md"
                                    )}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    <Code className="h-[15px] w-[15px]" />
                                    <span>QR Code</span>
                                    <ChevronDown className="h-2.5 w-2.5" />
                                  </motion.button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-56"
                                  sideOffset={6}
                                  align="start"
                                  alignOffset={-4}
                                >
                                  <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 30,
                                      mass: 0.8
                                    }}
                                    className="backdrop-blur-[2px] bg-white/95 border border-gray-100/20 shadow-lg rounded-lg overflow-hidden p-1.5"
                                  >
                                    <div className="flex flex-col gap-0.5">
                                      <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05, type: "spring", stiffness: 400, damping: 30 }}
                                        className="rounded-md overflow-hidden"
                                      >
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="w-full justify-start hover:bg-blue-50/50 group px-3 py-1.5 h-8"
                                        >
                                          <Code className="h-3.5 w-3.5 mr-2 transition-colors group-hover:text-blue-500" />
                                          <span className="transition-colors group-hover:text-blue-500 text-[13px]">Download QR Code</span>
                                        </Button>
                                      </motion.div>
                                      <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 30 }}
                                        className="rounded-md overflow-hidden"
                                      >
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="w-full justify-start hover:bg-blue-50/50 group px-3 py-1.5 h-8"
                                        >
                                          <History className="h-3.5 w-3.5 mr-2 transition-colors group-hover:text-blue-500" />
                                          <span className="transition-colors group-hover:text-blue-500 text-[13px]">Download Event Badge</span>
                                        </Button>
                                      </motion.div>

                                    </div>
                                  </motion.div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          <Separator orientation="vertical" className="h-6 bg-white/20 mx-1" />

                          <div className="flex items-center">

                            <Separator orientation="vertical" className="h-6 bg-white/20" />
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              className="h-9 px-2.5 text-sm font-medium text-white hover:text-white hover:bg-white/20 whitespace-nowrap transition-all duration-200 flex items-center gap-2 rounded-md"
                            >
                              <FileText className="h-[15px] w-[15px] -translate-y-[0.5px]" />
                              Assign to Template
                            </motion.button>
                            <Separator orientation="vertical" className="h-6 bg-white/20" />
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              className="h-9 px-2.5 text-sm font-medium text-white hover:text-white hover:bg-white/20 whitespace-nowrap transition-all duration-200 flex items-center gap-2 rounded-md"
                            >
                              <Users2 className="h-[15px] w-[15px] -translate-y-[0.5px]" />
                              Assign to Subteam
                            </motion.button>

                            <div className="flex items-center ml-1">
                              <Separator orientation="vertical" className="h-6 bg-white/20" />
                              <motion.button
                                whileHover={{ scale: 1.05, rotate: 90 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className="text-white hover:text-white p-2 rounded-full hover:bg-white/20 transition-colors duration-200 ml-1"
                                onClick={closeSelectionMenu}
                              >
                                <X className="h-5 w-5" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <TemplateSelectionDialog
        open={isTemplateDialogOpen2}
        userteamid={user?.team}
        memberId={idfortempmem}
        onOpenChange={setIsTemplateDialogOpen}
        currentTemplateId={currentTemplateId}
        onTemplateSelect={(templateId) => {
          console.log("Selected template:", templateId);
        }}
      />
      <AdminRolesDialog
        isOpen={showhandleedit}
        onClose={() => setshowHandleEdit(false)}
        user={zort}
      />
    </div>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MembersContent />
    </Suspense>
  );
}