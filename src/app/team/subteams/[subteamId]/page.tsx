"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BitPerms, getPermissionsByGroup } from "@/utils/bitwiseperms";
import Link from "next/link";
import { useUserStore } from "@/store/user-store";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";
import { Api } from "@/lib/api";
import {
  Users,
  Settings as SettingsIcon,
  CalendarClock,
  MessageSquare,
  FileText,
  Activity,
  Shield,
  ArrowLeft,
  ChevronDown,
  MoreHorizontal,
  Settings,
  LogOut,
  UserPlus,
  Upload,
  X,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  SearchableDropdown,
  DropdownItem,
} from "@/components/ui/searchable-dropdown";
import {
  SelectableDropdown,
  DropdownItem2,
} from "@/components/ui/selectable-dropdown";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeamMembersStore } from "@/store/team-members-store";

const SubteamDetailPage = () => {
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });
  const showNotification = (
    message: string,
    type: "success" | "error" = "success",
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
  const pathname = usePathname();
  const params = useParams();

  // Access subteamId from useParams hook
  const subteamId = params.subteamId as string;

  // State to store API response data
  const [subteamData, setSubteamData] = useState<any>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { members, fetchMembers, isLoading } = useTeamMembersStore();
  const { user, fetchUser, isLoading: isUserLoading } = useUserStore();
  const [isLoadingsub, setIsLoadingsub] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ALL state variables must be defined at the top level, before any conditional returns
  // State for restriction tab navigation
  const [restrictionTab, setRestrictionTab] = useState<
    "about" | "content" | "qrcode" | "settings"
  >("about");
  // State variables for about section restrictions
  const [availableSubteams, setAvailableSubteams] = useState<DropdownItem[]>([
    // This should be replaced with actual subteams data from your API
    {
      id: "1",
      name: "Marketing Team",
      description: "Handles all marketing campaigns and strategies",
      avatar: "/uploads/marketing-avatar.jpg", // Add actual avatar URLs
    },
    {
      id: "2",
      name: "Development Team",
      description: "Responsible for software development and maintenance",
      avatar: "/uploads/dev-avatar.jpg",
    },
    {
      id: "3",
      name: "Sales Team",
      description: "Manages client relationships and sales processes",
      avatar: "/uploads/sales-avatar.jpg",
    },
    {
      id: "4",
      name: "Customer Support",
      description: "Provides assistance and support to customers",
      avatar: "/uploads/support-avatar.jpg",
    },
    {
      id: "5",
      name: "Design Team",
      description: "Creates visual designs and user experiences",
      avatar: "/uploads/design-avatar.jpg",
    },
  ]);
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  // Mock templates data for Add Template functionality
  const [availableTemplates, setAvailableTemplates] = useState<DropdownItem[]>([
    {
      id: "template_1",
      name: "Modern Business Card",
      description: "Clean and professional design for business professionals",
      avatar: "/public/theme1.png", // Template logo/preview
    },
    {
      id: "template_2",
      name: "Creative Portfolio",
      description: "Vibrant design perfect for creative professionals",
      avatar: "/public/templates_cover.png",
    },
    {
      id: "template_3",
      name: "Corporate Executive",
      description: "Elegant layout for corporate executives and managers",
      avatar: "/public/theme1.png",
    },
    {
      id: "template_4",
      name: "Tech Startup",
      description: "Modern tech-focused design for startups and developers",
      avatar: "/public/templates_cover.png",
    },
    {
      id: "template_5",
      name: "Healthcare Professional",
      description:
        "Trust-building design for healthcare and medical professionals",
      avatar: "/public/theme1.png",
    },
    {
      id: "template_6",
      name: "Real Estate Agent",
      description: "Professional template for real estate professionals",
      avatar: "/public/templates_cover.png",
    },
  ]);
  interface Template {
    _id: string;
    templateName: string;
    bio?: string;
    coverPhoto?: string;
  }
  useEffect(() => {
    const fetchtemplates = async () => {
      try {
        if (user?.team) {
          const response = await Api.get(
            `templates/get-all?teamId=${user?.team}`,
          );
          const dropdownItems = response.data.templates.map(
            (template: Template) => ({
              id: template._id,
              name: template.templateName,
              description: template.bio || "No description provided", // fallback
              avatar: template.coverPhoto || "/defaultcover.jpg",
            }),
          );
          setAvailableTemplates(dropdownItems);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchtemplates();
  }, [user?.team]);

  // Handle subteam selection for copying restrictions
  const handleSubteamSelect = (subteam: DropdownItem) => {
    console.log("Selected subteam:", subteam);
    // Add your copy restrictions logic here
    // For example: copyRestrictionsFromSubteam(subteam.id);
  };

  // Handle template selection for Add Template functionality
  const handleTemplateSelect = async (selectedItems: string[]) => {
    try {
      await Api.patch(`/subteam/${subteamId}/assign/template`, {
        templateIds: selectedItems,
      });
      // Response geldikten sonra sayfayı yenile
      window.location.reload();
    } catch (error) {
      console.error("Template assign error:", error);
      // Hata varsa dilersen kullanıcıya bildirim gösterebilirsin
    }
  };

  // Handle CSV file upload
  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      showNotification("Please select a valid CSV file", "error");
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    const file = files[0];

    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      showNotification("Please select a valid CSV file", "error");
    }
  };

  // Handle CSV upload submission
  const handleCsvUpload = async () => {
    if (!csvFile) {
      showNotification("Please select a CSV file first", "error");
      return;
    }

    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append("csvFile", csvFile);

      // Replace this with your actual API endpoint for CSV upload
      const response = await Api.post(
        `/subteam/${subteamId}/members/upload-csv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      showNotification("Members uploaded successfully!", "success");
      setIsCsvDialogOpen(false);
      setCsvFile(null);

      // Refresh the members list
      fetchMembers();
    } catch (error: any) {
      console.error("Error uploading CSV:", error);
      showNotification(
        error?.response?.data?.message || "Failed to upload CSV file",
        "error",
      );
    }
  };

  const handleCsvDialogClose = () => {
    setIsCsvDialogOpen(false);
    setCsvFile(null);
    setIsDragOver(false);
  };
  const [profilePictureRestricted, setProfilePictureRestricted] =
    useState(false);
  const [permissionsres, setPermissionsres] = useState<bigint>(0n);
  const [nameRestricted, setNameRestricted] = useState(false);
  const [jobTitleRestricted, setJobTitleRestricted] = useState(true);
  const [bioRestricted, setBioRestricted] = useState(true);
  const [locationRestricted, setLocationRestricted] = useState(true);
  const [companyLogoRestricted, setCompanyLogoRestricted] = useState(true);
  // State for search text and member selection
  const [searchText, setSearchText] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedNonMembers, setSelectedNonMembers] = useState<string[]>([]);

  // State for CSV upload dialog
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Tab and styling states
  const [activeTab, setActiveTab] = useState("edit-members");
  // Team colors and styles
  const colorOptions = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];
  const [selectedTeamColor, setSelectedTeamColor] = useState(colorOptions[0]);
  // Image upload preview states
  const [teamLogo, setTeamLogo] = useState<string>("/company_logo.png");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  // Form state with default values that will be updated when data loads

  // Update teamLogo when subteamData is loaded
  useEffect(() => {
    const fetchSubteamData = async () => {
      try {
        setIsLoadingsub(true);
        setError(null);
        const response = await Api.get(`/subteam/${subteamId}`);
        setSubteamData(response.data);
        setPermissionsres(BigInt(response.data.subTeam.permissions));
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Failed to fetch subteam data",
        );
        console.error("Error fetching subteam data:", err);
      } finally {
        setIsLoadingsub(false);
      }
    };

    fetchSubteamData();
  }, [subteamId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Fetch subteam data when component mounts

  const togglePermission = (perm: bigint) => {
    setPermissionsres((prev) =>
      (prev & perm) !== 0n ? prev & ~perm : prev | perm,
    );
  };

  const handleSubres = async () => {
    const formData = new FormData();
    formData.append("permissions", permissionsres.toString()); // BigInt -> string
    console.log(permissionsres.toString());
    try {
      const response = await Api.patch(
        `/subteam/${subteamId}/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log("API response:", response.data);
      showNotification("Subteam permissions updated successfully", "success");
    } catch (error) {
      console.error("API error:", error);
      showNotification("Failed to update links", "error");
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDatagen = new FormData();
    formDatagen.append("name", subteamData.subTeam.name);
    formDatagen.append("description", subteamData.subTeam.description || "");
    if (logoFile) {
      formDatagen.append("logo", logoFile); // logo dosyasını ekliyoruz
    }

    try {
      const response = await Api.patch(
        `/subteam/${subteamId}/update`,
        formDatagen,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log("API response:", response.data);
      showNotification("Subteam updated successfully", "success");
    } catch (error) {
      console.error("API error:", error);
      showNotification("Failed to update links", "error");
    }
  };
  // Handler for form input changes - defined before any conditional returns
  const handleInputChange = (field: string, value: string) => {
    setSubteamData((prev: any) => ({
      ...prev,
      subTeam: {
        ...prev?.subTeam,
        [field]: value,
      },
    }));
  };

  // Filter members based on subteam membership and search text
  const determineTeamMembership = () => {
    // Make sure both members and subteamData?.subTeam?.members exist
    if (
      !members ||
      !subteamData?.subTeam?.members ||
      !Array.isArray(members) ||
      !Array.isArray(subteamData.subTeam.members)
    ) {
      return { teamMembersList: [], nonTeamMembersList: [] };
    }

    // Determine who is part of the subteam by comparing IDs
    const teamMembersList = members.filter(
      (member) =>
        member &&
        member._id &&
        subteamData.subTeam.members.includes(member._id),
    );

    const nonTeamMembersList = members.filter(
      (member) =>
        member &&
        member._id &&
        !subteamData.subTeam.members.includes(member._id),
    );

    return { teamMembersList, nonTeamMembersList };
  };

  // Event handlers for checkboxes - defined before any conditional returns
  const handleSelectAllMembers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const { teamMembersList } = determineTeamMembership();
      setSelectedMembers(teamMembersList.map((member) => member._id));
    } else {
      setSelectedMembers([]);
    }
  };

  // Toggle member selection - defined before any conditional returns
  const toggleMemberSelection = (id: string, inTeam: boolean) => {
    if (inTeam) {
      setSelectedMembers((prev) =>
        prev.includes(id)
          ? prev.filter((memberId) => memberId !== id)
          : [...prev, id],
      );
    } else {
      setSelectedNonMembers((prev) =>
        prev.includes(id)
          ? prev.filter((memberId) => memberId !== id)
          : [...prev, id],
      );
    }
  };

  // Handle update members - defined before any conditional returns
  const handleUpdateMembers = async () => {
    if (!subteamData) return;

    try {
      // Prepare data for the API request
      const membersToRemove = selectedMembers;
      const membersToAdd = selectedNonMembers;

      console.log("Selected members to remove:", membersToRemove);
      console.log("Selected non-members to add:", membersToAdd);

      // Only proceed if there are changes to make
      if (membersToRemove.length > 0 || membersToAdd.length > 0) {
        setIsLoadingsub(true);

        // Make the API request to update the subteam membership
        const response = await Api.post(`/subteam/${subteamId}/assign`, {
          add: membersToAdd,
          remove: membersToRemove,
        });

        // Update the local state with the new data
        setSubteamData(response.data);

        // Clear selections after successful update
        setSelectedMembers([]);
        setSelectedNonMembers([]);

        // Show success message or notification here if needed
        window.location.reload();
      }
    } catch (err: any) {
      // Handle errors
      setError(
        err?.response?.data?.message || "Failed to update subteam members",
      );
      console.error("Error updating subteam members:", err);
    } finally {
      setIsLoadingsub(false);
    }
  };
  const [selectAllresChecked, setSelectAllresChecked] = useState(false);
  useEffect(() => {
    if (restrictionTab === "about") {
      const allChecked = getPermissionsByGroup("about").every(
        (bit) => (permissionsres & bit) !== 0n,
      );
      setSelectAllresChecked(allChecked);
    }
    if (restrictionTab === "content") {
      const allChecked = getPermissionsByGroup("content").every(
        (bit) => (permissionsres & bit) !== 0n,
      );
      setSelectAllresChecked(allChecked);
    }
    if (restrictionTab === "qrcode") {
      const allChecked = getPermissionsByGroup("qrcode").every(
        (bit) => (permissionsres & bit) !== 0n,
      );
      setSelectAllresChecked(allChecked);
    }
    if (restrictionTab === "settings") {
      const allChecked = getPermissionsByGroup("settings").every(
        (bit) => (permissionsres & bit) !== 0n,
      );
      setSelectAllresChecked(allChecked);
    }
  }, [restrictionTab, permissionsres]);
  const handleSelectAllresChange = (val: boolean) => {
    setSelectAllresChecked(val);
    if (restrictionTab === "about") {
      getPermissionsByGroup("about").forEach((bit) => {
        const isSet = (permissionsres & bit) !== 0n;
        if (val !== isSet) {
          togglePermission(bit);
        }
      });
    }
    if (restrictionTab === "content") {
      getPermissionsByGroup("content").forEach((bit) => {
        const isSet = (permissionsres & bit) !== 0n;
        if (val !== isSet) {
          togglePermission(bit);
        }
      });
    }
    if (restrictionTab === "qrcode") {
      getPermissionsByGroup("qrcode").forEach((bit) => {
        const isSet = (permissionsres & bit) !== 0n;
        if (val !== isSet) {
          togglePermission(bit);
        }
      });
    }
    if (restrictionTab === "settings") {
      getPermissionsByGroup("settings").forEach((bit) => {
        const isSet = (permissionsres & bit) !== 0n;
        if (val !== isSet) {
          togglePermission(bit);
        }
      });
    }
  };
  // Display loading state while data is being fetched
  if (isLoadingsub) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-black"></div>
          <p className="text-lg text-gray-600">Loading subteam data...</p>
        </div>
      </div>
    );
  }

  // Display error state if there was an error
  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 flex items-center justify-center bg-red-100 rounded-full">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-lg text-gray-600">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Ensure subteamData and subteam object exist before proceeding
  if (!subteamData || !subteamData.subTeam) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-black"></div>
          <p className="text-lg text-gray-600">Loading subteam data...</p>
        </div>
      </div>
    );
  }

  // Get team members based on subteam membership
  const { teamMembersList, nonTeamMembersList } = determineTeamMembership();

  // Filter members based on search text with proper null/undefined checks
  const filteredTeamMembers = teamMembersList.filter((member) => {
    if (!member) return false;
    const nameMatch = member.name
      ? member.name.toLowerCase().includes(searchText.toLowerCase())
      : false;
    const emailMatch = member.email
      ? member.email.toLowerCase().includes(searchText.toLowerCase())
      : false;
    return nameMatch || emailMatch;
  });

  const filteredNonTeamMembers = nonTeamMembersList.filter((member) => {
    if (!member) return false;
    const nameMatch = member.name
      ? member.name.toLowerCase().includes(searchText.toLowerCase())
      : false;
    const emailMatch = member.email
      ? member.email.toLowerCase().includes(searchText.toLowerCase())
      : false;
    return nameMatch || emailMatch;
  });

  // Event handlers for checkboxes

  const handleSelectAllNonMembers = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.checked) {
      setSelectedNonMembers(filteredNonTeamMembers.map((member) => member._id));
    } else {
      setSelectedNonMembers([]);
    }
  };

  // These functions are already defined above, so we don't need to repeat them here

  // Computed properties from API data with safe default values
  // At this point we've already checked that subteamData and subteamData.subTeam exist
  // Get computed properties from the API data - safe to use after we've checked subteamData exists
  const subteamInfo = {
    id: subteamId,
    name: subteamData.subTeam.name || "Untitled Subteam",
    description: subteamData.subTeam.description || "",
    image: subteamData.subTeam.logo || "/company_logo.png",
    memberCount: Array.isArray(subteamData.subTeam.members)
      ? subteamData.subTeam.members.length
      : 0,
    createdAt: subteamData.subTeam.createdAt
      ? new Date(subteamData.subTeam.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Unknown",
    status: subteamData.subTeam.active ? "Active" : "Inactive",
  };

  // Navigation items for the sidebar
  const navItems = [
    {
      name: "Edit Members",
      value: "edit-members",
      icon: UserPlus,
      description: "Add or remove team members",
    },
    {
      name: "General",
      value: "general",
      icon: Activity,
      description: "General information about the subteam",
    },
    {
      name: "Restrictions",
      value: "restrictions",
      icon: Shield,
      description: "Team restrictions and access control",
    },
    {
      name: "Template Auto Assign",
      value: "template-auto-assign",
      icon: FileText,
      description: "Configure automatic template assignments",
    },
    // {
    //   name: "Integrations",
    //   value: "integrations",
    //   icon: Settings,
    //   description: "Configure team integrations",
    // },
    {
      name: "View Members",
      value: "view-members",
      icon: Users,
      description: "View all team members",
    },
  ];
  // Get filtered members based on the search text
  const getFilteredMembers = () => {
    const { teamMembersList, nonTeamMembersList } = determineTeamMembership();

    // Filter team members based on search text with proper null/undefined checks
    const filteredTeamMembers = teamMembersList.filter((member) => {
      if (!member) return false;
      const nameMatch = member.name
        ? member.name.toLowerCase().includes(searchText.toLowerCase())
        : false;
      const emailMatch = member.email
        ? member.email.toLowerCase().includes(searchText.toLowerCase())
        : false;
      return nameMatch || emailMatch;
    });

    // Filter non-team members based on search text with proper null/undefined checks
    const filteredNonTeamMembers = nonTeamMembersList.filter((member) => {
      if (!member) return false;
      const nameMatch = member.name
        ? member.name.toLowerCase().includes(searchText.toLowerCase())
        : false;
      const emailMatch = member.email
        ? member.email.toLowerCase().includes(searchText.toLowerCase())
        : false;
      return nameMatch || emailMatch;
    });

    return { filteredTeamMembers, filteredNonTeamMembers };
  };

  // Get filtered members lists

  const renderContent = () => {
    switch (activeTab) {
      case "edit-members":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Edit Members</h2>

            {/* Search & Add Members Bar */}
            <div className="flex justify-between items-center gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                    <path d="M12 3a9 9 0 0 0-9 9 9.76 9.76 0 0 0 1.3 5"></path>
                    <path d="M12 3a9 9 0 0 1 9 9 9.76 9.76 0 0 1-1.3 5"></path>
                    <path d="M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                    <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
                    <path d="M19 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                    <path d="M12 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                    <path d="M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                  </svg>
                </div>

                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 py-2 px-4 h-12 rounded-full bg-gray-50 text-sm font-normal focus:outline-none w-full"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="rounded-full flex items-center gap-2 border border-gray-300"
                onClick={() => setIsCsvDialogOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
                Add Members via CSV
              </Button>
            </div>

            {/* Tables for Members */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Part of Subteam Table */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="p-3 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">Part of Subteam</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 py-0.5 px-1.5 rounded-full">
                      ({filteredTeamMembers.length})
                    </span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="selectAll1"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={
                        selectedMembers.length === filteredTeamMembers.length &&
                        filteredTeamMembers.length > 0
                      }
                      onChange={handleSelectAllMembers}
                    />
                    <label
                      htmlFor="selectAll1"
                      className="ml-2 text-xs text-gray-600"
                    >
                      Select All
                    </label>
                  </div>
                </div>
                <Table>
                  <TableBody>
                    {filteredTeamMembers.map((member) => (
                      <TableRow key={member._id}>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={selectedMembers.includes(member._id)}
                              onChange={() =>
                                toggleMemberSelection(member._id, true)
                              }
                            />
                            <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-100">
                              <Image
                                src={member.profileImage || "/defaultpp.png"}
                                alt={member.name}
                                className="object-cover"
                                fill
                                sizes="40px"
                              />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">
                                {member.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {member.roles?.teamRole && (
                            <span className="bg-gray-100 text-xs px-2 py-1 rounded text-gray-600">
                              {member.roles.teamRole}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredTeamMembers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-6">
                          <p className="text-sm text-gray-500">
                            No team members found
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Not part of Subteam Table */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="p-3 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">Not part of Subteam</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 py-0.5 px-1.5 rounded-full">
                      ({filteredNonTeamMembers.length})
                    </span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="selectAll2"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={
                        selectedNonMembers.length ===
                          filteredNonTeamMembers.length &&
                        filteredNonTeamMembers.length > 0
                      }
                      onChange={handleSelectAllNonMembers}
                    />
                    <label
                      htmlFor="selectAll2"
                      className="ml-2 text-xs text-gray-600"
                    >
                      Select All
                    </label>
                  </div>
                </div>
                <Table>
                  <TableBody>
                    {filteredNonTeamMembers.map((member) => (
                      <TableRow key={member._id}>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={selectedNonMembers.includes(member._id)}
                              onChange={() =>
                                toggleMemberSelection(member._id, false)
                              }
                            />
                            <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-100">
                              <Image
                                src={member.profileImage || "/defaultpp.png"}
                                alt={member.name}
                                className="object-cover"
                                fill
                                sizes="40px"
                              />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">
                                {member.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {member.roles?.teamRole && (
                            <span className="bg-gray-100 text-xs px-2 py-1 rounded text-gray-600">
                              {member.roles.teamRole}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredNonTeamMembers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-6">
                          <p className="text-sm text-gray-500">
                            No members found
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>{" "}
              </div>{" "}
            </div>

            {/* Bottom Help Section */}

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
              <Button
                className="rounded-full px-6"
                onClick={handleUpdateMembers}
              >
                Update Members
              </Button>
            </div>
          </div>
        );
      case "general":
        return (
          <div className="space-y-6 max-w-[500px]">
            <h2 className="text-xl font-semibold">General</h2>{" "}
            {/* Subteam Logo */}
            <div className="mb-8">
              <div>
                <h3 className="text-sm font-medium mb-2">Subteam logo</h3>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-[90px] h-[90px] rounded-full bg-white border border-gray-200 relative flex items-center justify-center overflow-hidden">
                      {subteamData.subTeam.logo ? (
                        <Image
                          src={subteamData.subTeam.logo}
                          alt="Subteam Logo"
                          width={90}
                          height={90}
                          className="h-full object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center bg-gray-50 h-full w-full">
                          <Shield className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-sm text-gray-700">
                      Help your teammates represent their team by adding a logo.
                    </p>
                    <label className="mt-2 cursor-pointer text-sm text-blue-500">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const fileUrl = URL.createObjectURL(file);
                            handleInputChange("logo", fileUrl);
                            setLogoFile(file); // gerçek dosya
                          }
                        }}
                      />
                      Upload photo
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {/* Subteam Name */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  Subteam name*
                </label>
                <input
                  type="text"
                  className="px-4 py-3 h-12 w-full rounded-md bg-gray-50 text-sm font-normal focus:outline-none"
                  placeholder="Yazılım"
                  value={subteamData.subTeam.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  Description
                </label>
                <textarea
                  className="px-4 py-3 resize-none rounded-md bg-gray-50 text-sm font-normal focus:outline-none min-h-[80px] w-full"
                  placeholder="Yazılım Ekibi"
                  value={subteamData.subTeam.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-center gap-2 pt-6">
              <Button
                variant="outline"
                className="px-6 rounded-md bg-gray-100 border-0"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="px-6 rounded-md">
                Update
              </Button>
            </div>
          </div>
        );
      case "restrictions":
        return (
          subteamData !== null && (
            <div className="space-y-6 max-w-[650px] mx-auto">
              {/* Header with flex layout to align title and button */}
              <div className="flex justify-between items-center">
                <h2 className="text-base font-medium">Restrictions</h2>
                <SearchableDropdown
                  items={availableSubteams}
                  buttonText="Copy restrictions from another Subteam"
                  placeholder="Search subteams..."
                  onItemSelect={handleSubteamSelect}
                  emptyMessage="No subteams found"
                />
              </div>

              {/* Description text */}
              <div className="text-gray-600 text-sm space-y-1">
                <p>
                  Restrict members from being able to change account settings.
                </p>
                <p>Restrictions will not be applied to admins.</p>
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Allow change requests */}
              <div className="bg-white rounded-lg">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      Press the button to save changes
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSubres}
                    className="rounded-full bg-black text-sm px-4 py-2 h-auto text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex border border-gray-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => setRestrictionTab("about")}
                  className={`flex-1 py-3 text-sm font-medium ${restrictionTab === "about" ? "bg-white border-b-2 border-black" : "bg-gray-50 text-gray-500"}`}
                >
                  About
                </button>
                <button
                  onClick={() => setRestrictionTab("content")}
                  className={`flex-1 py-3 text-sm font-medium ${restrictionTab === "content" ? "bg-white border-b-2 border-black" : "bg-gray-50 text-gray-500"}`}
                >
                  Content
                </button>
                <button
                  onClick={() => setRestrictionTab("qrcode")}
                  className={`flex-1 py-3 text-sm font-medium ${restrictionTab === "qrcode" ? "bg-white border-b-2 border-black" : "bg-gray-50 text-gray-500"}`}
                >
                  QR Code
                </button>
                <button
                  onClick={() => setRestrictionTab("settings")}
                  className={`flex-1 py-3 text-sm font-medium ${restrictionTab === "settings" ? "bg-white border-b-2 border-black" : "bg-gray-50 text-gray-500"}`}
                >
                  Settings
                </button>
              </div>

              {/* Lock All */}
              <div className="bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between p-4">
                  <p className="text-sm font-medium">Lock All</p>
                  <Switch
                    checked={selectAllresChecked}
                    onCheckedChange={handleSelectAllresChange}
                    className="ml-4"
                  />
                </div>
              </div>

              {/* Tab content based on selected restriction tab */}
              {restrictionTab === "about" && (
                <>
                  {/* About Section Description */}
                  <div className="abores">
                    <div className="bg-gray-50 py-5 px-4 rounded-lg text-sm text-gray-500">
                      Restrict the ability for members to change fields in the
                      about section of their card
                    </div>

                    {/* Profile restrictions */}
                    <div className="space-y-4">
                      {/* Profile Picture */}
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <p className="text-sm font-medium">Profile Picture</p>
                          <svg
                            className="ml-4 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                          </svg>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="mr-3 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* Show closed lock if restricted, open lock if not restricted */}
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                (permissionsres & BitPerms.profilePicture) !==
                                0n
                                  ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              }
                            />
                          </svg>
                          <Switch
                            checked={
                              (permissionsres & BitPerms.profilePicture) !== 0n
                            }
                            onCheckedChange={() =>
                              togglePermission(BitPerms.profilePicture)
                            }
                            className="ml-1"
                          />
                        </div>
                      </div>

                      {/* Name */}
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <p className="text-sm font-medium">Name</p>
                          <svg
                            className="ml-4 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                          </svg>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="mr-3 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* Show closed lock if restricted, open lock if not restricted */}
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                (permissionsres & BitPerms.name) !== 0n
                                  ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              }
                            />
                          </svg>
                          <Switch
                            checked={(permissionsres & BitPerms.name) !== 0n}
                            onCheckedChange={() =>
                              togglePermission(BitPerms.name)
                            }
                            className="ml-1"
                          />
                        </div>
                      </div>

                      {/* Job Title */}
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <p className="text-sm font-medium">Job Title</p>
                          <svg
                            className="ml-4 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="mr-3 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* Show closed lock if restricted, open lock if not restricted */}
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                (permissionsres & BitPerms.jobTitle) !== 0n
                                  ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              }
                            />
                          </svg>
                          <Switch
                            checked={
                              (permissionsres & BitPerms.jobTitle) !== 0n
                            }
                            onCheckedChange={() =>
                              togglePermission(BitPerms.jobTitle)
                            }
                            className="ml-1"
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <p className="text-sm font-medium">Bio</p>
                          <svg
                            className="ml-4 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="mr-3 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* Show closed lock if restricted, open lock if not restricted */}
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                (permissionsres & BitPerms.bio) !== 0n
                                  ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              }
                            />
                          </svg>
                          <Switch
                            checked={(permissionsres & BitPerms.bio) !== 0n}
                            onCheckedChange={() =>
                              togglePermission(BitPerms.bio)
                            }
                            className="ml-1"
                          />
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <p className="text-sm font-medium">Location</p>
                          <svg
                            className="ml-4 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="mr-3 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* Show closed lock if restricted, open lock if not restricted */}
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                (permissionsres & BitPerms.location) !== 0n
                                  ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                  : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              }
                            />
                          </svg>
                          <Switch
                            checked={
                              (permissionsres & BitPerms.location) !== 0n
                            }
                            onCheckedChange={() =>
                              togglePermission(BitPerms.location)
                            }
                            defaultChecked
                            className="ml-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <p className="text-sm font-medium">Company</p>
                          <svg
                            className="ml-4 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="mr-3 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* Show closed lock if restricted, open lock if not restricted */}
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                (permissionsres & BitPerms.company) !== 0n
                                  ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              }
                            />
                          </svg>
                          <Switch
                            checked={(permissionsres & BitPerms.company) !== 0n}
                            onCheckedChange={() =>
                              togglePermission(BitPerms.company)
                            }
                            className="ml-1"
                          />
                        </div>
                      </div>
                      {/* Company Logo */}
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <p className="text-sm font-medium">Company Logo</p>
                          <svg
                            className="ml-4 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="mr-3 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* Show closed lock if restricted, open lock if not restricted */}
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                (permissionsres & BitPerms.companyLogo) !== 0n
                                  ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              }
                            />
                          </svg>
                          <Switch
                            checked={
                              (permissionsres & BitPerms.companyLogo) !== 0n
                            }
                            onCheckedChange={() =>
                              togglePermission(BitPerms.companyLogo)
                            }
                            defaultChecked
                            className="ml-1"
                          />
                        </div>
                      </div>

                      {/* Card Color */}
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <p className="text-sm font-medium">Card Color</p>
                          <svg
                            className="ml-4 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="mr-3 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* Show closed lock if restricted, open lock if not restricted */}
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                (permissionsres & BitPerms.colorTheme) !== 0n
                                  ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              }
                            />
                          </svg>
                          <Switch
                            checked={
                              (permissionsres & BitPerms.colorTheme) !== 0n
                            }
                            onCheckedChange={() =>
                              togglePermission(BitPerms.colorTheme)
                            }
                            defaultChecked
                            className="ml-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {restrictionTab === "content" && (
                <>
                  {/* Content Section Description */}
                  <div className="bg-gray-50 py-5 px-4 rounded-lg text-sm text-gray-500">
                    Restrict the ability for members to manage their content
                  </div>

                  {/* Content restrictions */}
                  <div className="space-y-4">
                    {/* Links */}
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Text</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.text) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.text) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.text)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Call</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.call) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.call) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.call)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Email</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.email) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.email) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.email)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Contactcard</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.contactcard) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.contactcard) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.contactcard)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Adress</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.adress) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.adress) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.adress)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Facetime</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.facetime) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.facetime) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.facetime)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Whatsapp</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.whatsapp) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.whatsapp) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.whatsapp)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Instagram</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.instagram) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.instagram) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.instagram)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Linkedin</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.linkedin) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.linkedin) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.linkedin)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Facebook</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.facebook) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.facebook) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.facebook)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Youtube</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.youtube) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.youtube) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.youtube)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Twitter</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.twitter) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.twitter) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.twitter)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Tiktok</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.tiktok) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.tiktok) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.tiktok)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Snapchat</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.snapchat) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.snapchat) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.snapchat)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Twitch</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.twitch) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.twitch) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.twitch)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Pinterest</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.pinterest) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.pinterest) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.pinterest)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Wechat</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.wechat) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.wechat) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.wechat)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Discord</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.discord) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.discord) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.discord)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Telegram</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.telegram) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.telegram) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.telegram)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Thread</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.thread) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.thread) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.thread)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Clubhouse</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.clubhouse) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.clubhouse) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.clubhouse)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Website</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.website) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.website) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.website)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Calendly</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.calendly) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.calendly) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.calendly)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Calendlyembed</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.calendlyembed) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.calendlyembed) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.calendlyembed)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Rewiews</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.rewiews) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.rewiews) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.rewiews)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Etsy</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.etsy) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.etsy) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.etsy)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Applimk</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.applimk) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.applimk) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.applimk)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Chillpaper</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.chillpaper) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.chillpaper) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.chillpaper)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Msbookings</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.msbookings) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.msbookings) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.msbookings)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Booksy</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.booksy) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.booksy) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.booksy)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Square</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.square) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.square) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.square)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Yelp</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.yelp) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.yelp) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.yelp)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Teamdirectory</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.teamdirectory) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.teamdirectory) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.teamdirectory)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Embedvideo</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.embedvideo) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.embedvideo) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.embedvideo)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Textsection</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.textsection) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.textsection) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.textsection)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">File</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.file) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.file) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.file)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Dropdown</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.dropdown) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.dropdown) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.dropdown)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Featured</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.featured) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.featured) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.featured)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Customlink</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.customlink) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.customlink) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.customlink)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Zillow</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.zillow) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.zillow) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.zillow)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Cashapp</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.cashapp) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.cashapp) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.cashapp)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Venmo</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.venmo) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.venmo) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.venmo)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Paypal</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.paypal) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.paypal) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.paypal)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Zelle</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.zelle) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.zelle) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.zelle)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Spotify</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.spotify) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.spotify) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.spotify)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Applemusic</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.applemusic) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.applemusic) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.applemusic)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Soundcloud</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.soundcloud) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.soundcloud) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.soundcloud)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Podcats</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.podcats) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.podcats) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.podcats)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Poshmark</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.poshmark) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.poshmark) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.poshmark)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Mediakits</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.mediakits) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.mediakits) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.mediakits)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Opensea</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.opensea) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.opensea) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.opensea)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Hoobe</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.hoobe) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.hoobe) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.hoobe)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Linktree</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.linktree) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.linktree) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.linktree)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {restrictionTab === "qrcode" && (
                <>
                  {/* QR Code Section Description */}
                  <div className="bg-gray-50 py-5 px-4 rounded-lg text-sm text-gray-500">
                    Restrict the ability for members to customize their QR code
                  </div>

                  {/* QR Code restrictions */}
                  <div className="space-y-4">
                    {/* QR Style */}
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.qrcolor) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <p className="text-sm font-medium">Color</p>
                      </div>
                      <Switch
                        checked={(permissionsres & BitPerms.qrcolor) !== 0n}
                        onCheckedChange={() =>
                          togglePermission(BitPerms.qrcolor)
                        }
                        className="ml-4"
                      />
                    </div>

                    {/* QR Logo */}
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.qrcustomlogo) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <p className="text-sm font-medium">QR Logo</p>
                      </div>
                      <Switch
                        checked={
                          (permissionsres & BitPerms.qrcustomlogo) !== 0n
                        }
                        onCheckedChange={() =>
                          togglePermission(BitPerms.qrcustomlogo)
                        }
                        className="ml-4"
                      />
                    </div>
                  </div>
                </>
              )}

              {restrictionTab === "settings" && (
                <>
                  {/* Settings Section Description */}
                  <div className="bg-gray-50 py-5 px-4 rounded-lg text-sm text-gray-500">
                    Restrict the ability for members to change their account
                    settings
                  </div>

                  {/* Settings restrictions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">
                          Exporting Leads to CRM
                        </p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.exportleadcrm) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.exportleadcrm) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.exportleadcrm)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Downloading leads</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.downloadleads) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.downloadleads) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.downloadleads)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">
                          Downloading leads as contacts
                        </p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres &
                                BitPerms.downloadleadascontact) !==
                              0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres &
                              BitPerms.downloadleadascontact) !==
                            0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.downloadleadascontact)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">
                          Exporting Analytics Data
                        </p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.exportanalitics) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.exportanalitics) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.exportanalitics)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Email Signature</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.emailsign) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={(permissionsres & BitPerms.emailsign) !== 0n}
                          onCheckedChange={() =>
                            togglePermission(BitPerms.emailsign)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">
                          Virtual Backgrounds
                        </p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.virtualbackground) !==
                              0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.virtualbackground) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.virtualbackground)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">
                          Create new digital cards
                        </p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.createnewcard) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.createnewcard) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.createnewcard)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Switch Cards</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.switchcard) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.switchcard) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.switchcard)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Account Email</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.accountmail) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.accountmail) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.accountmail)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg mb-2">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">Follow up email</p>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              (permissionsres & BitPerms.followupmail) !== 0n
                                ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            }
                          />
                        </svg>
                        <Switch
                          checked={
                            (permissionsres & BitPerms.followupmail) !== 0n
                          }
                          onCheckedChange={() =>
                            togglePermission(BitPerms.followupmail)
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        );
      case "template-auto-assign":
        return (
          <div className="space-y-6 max-w-[650px]">
            <h2 className="text-base font-medium mb-2">Template Auto Assign</h2>
            <p className="text-sm text-gray-500 mb-6">
              Select up to three templates to be auto assigned to members upon
              adding them to a subteam.
            </p>

            {/* Template List */}
            <div className="space-y-4">
              {/* BABEL Template */}

              {availableTemplates
                .filter((template) =>
                  subteamData?.subTeam?.templates?.includes(template.id),
                )
                .map((template, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-white border border-gray-200 overflow-hidden">
                          <Image
                            src={template.avatar!}
                            alt={`${template.name} Template`}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{template.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Add Template Button */}
            <div className="mt-6 flex justify-between">
              <SelectableDropdown
                items={availableTemplates}
                buttonText="Add Template"
                buttonVariant="ghost"
                buttonClassName="text-[#0096FF] items-center rounded-full gap-2 p-3 hover:text-sky-500 hover:bg-sky-400/10"
                placeholder="Search templates..."
                onItemSelect={handleTemplateSelect}
                emptyMessage="No templates found"
                maxHeight="400px"
                width="400px"
              />
            </div>

            {/* Action Buttons */}
          </div>
        );

      // case "integrations":
      //   return (
      //     <div className="space-y-4">
      //       <h2 className="text-xl font-semibold">Team Integrations</h2>
      //       <p className="text-muted-foreground">
      //         Connect your team with external services and tools.
      //       </p>
      //
      //       {/* Available Integrations */}
      //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      //         {/* Integration Cards */}
      //         {[
      //           { name: "Slack", icon: "🔄", connected: true },
      //           { name: "Google Workspace", icon: "📁", connected: false },
      //           { name: "Microsoft Teams", icon: "👥", connected: false },
      //           { name: "Zoom", icon: "📹", connected: true },
      //           { name: "Trello", icon: "📋", connected: false },
      //           { name: "GitHub", icon: "💻", connected: false },
      //         ].map((integration, index) => (
      //           <div
      //             key={index}
      //             className="bg-[#F7F7F7] p-4 rounded-lg flex justify-between items-center"
      //           >
      //             <div className="flex items-center gap-3">
      //               <div className="w-10 h-10 rounded-md bg-slate-200 flex items-center justify-center">
      //                 <span className="text-xl">{integration.icon}</span>
      //               </div>
      //               <div>
      //                 <p className="text-sm font-medium">{integration.name}</p>
      //                 <p className="text-xs text-muted-foreground">
      //                   {integration.connected ? "Connected" : "Not connected"}
      //                 </p>
      //               </div>
      //             </div>
      //             <Button
      //               variant={integration.connected ? "outline" : "default"}
      //               size="sm"
      //             >
      //               {integration.connected ? "Configure" : "Connect"}
      //             </Button>
      //           </div>
      //         ))}
      //       </div>
      //     </div>
      //   );

      case "view-members":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Team Members</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search members..."
                  className="px-3 py-1 rounded-lg bg-[#F7F7F7] text-sm font-normal focus:outline-none"
                />
                <Button variant="outline">Filter</Button>
              </div>
            </div>

            {/* Members List in View Mode */}
            <div className="space-y-4">
              {/* Sample members - you would map through actual member data */}
              {Array(8)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 relative">
                        <Image
                          src={`https://i.pravatar.cc/150?img=${index + 10}`}
                          alt="Member avatar"
                          className="rounded-full object-cover border"
                          fill
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          Team Member {index + 1}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Role:{" "}
                          {index === 0
                            ? "Team Lead"
                            : index === 1
                              ? "Admin"
                              : "Member"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xs font-medium">
                        {index % 3 === 0 ? "Active" : "Offline"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Joined: Jan {index + 1}, 2023
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" className="px-3">
                Previous
              </Button>
              {[1, 2, 3].map((page) => (
                <Button
                  key={page}
                  variant={page === 1 ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="px-3">
                Next
              </Button>
            </div>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  // Show loading state if data is still loading
  if (isLoadingsub || !subteamData) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-black"></div>
          <p className="text-lg text-gray-600">Loading subteam data...</p>
        </div>
      </div>
    );
  }

  // Show error state if there was an error
  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 flex items-center justify-center bg-red-100 rounded-full">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-lg text-gray-600">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-3 flex-1 overflow-hidden">
        <div className="h-full w-full max-w-7xl mx-auto flex flex-col">
          {/* Header section */}
          <div className="h-[60px] mb-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                asChild
              >
                <Link href="/team/subteams">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="h-12 w-12 relative">
                <Image
                  src={subteamData?.subTeam?.logo || "/company_logo.png"}
                  alt={subteamData?.subTeam?.name || "Subteam"}
                  className="rounded-md object-cover border"
                  fill
                  sizes="(max-width: 768px) 100vw, 48px"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold leading-tight">
                  {subteamData?.subTeam?.name || "Loading..."}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {subteamData?.subTeam?.members?.length || 0} Members
                </p>
              </div>
            </div>

            {/* <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-slate-100"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end" alignOffset={0}>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Edit Team</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Add Members</span>
                  </Button>
                  <Separator className="my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Archive Team</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover> */}
          </div>

          {/* Card that fills the remaining space */}
          <Card className="w-full border overflow-hidden flex-1 mb-1">
            <div className="flex flex-col md:flex-row h-full">
              {/* Sidebar - 1/6 width */}
              <div className="w-full md:w-1/6 border-r h-full overflow-y-auto">
                <div className="p-2 pt-3">
                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = activeTab === item.value;
                      return (
                        <button
                          key={item.value}
                          onClick={() => {
                            if (item.value === "view-members") {
                              window.location.href = `/team/members?subteams=${subteamData.subTeam.name}`;
                            } else {
                              setActiveTab(item.value);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                            isActive
                              ? "bg-black text-white"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          )}
                        >
                          <item.icon className="h-3.5 w-3.5" />
                          <span className="tracking-tight">{item.name}</span>
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute right-0 w-0.5 h-4 bg-foreground rounded-l-full mx-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Content - full width (5/6) */}
              <div className="w-full md:w-5/6 p-6 h-full overflow-y-auto">
                {notification.visible && (
                  <div
                    className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-md shadow-lg ${
                      notification.type === "success"
                        ? "bg-green-600"
                        : "bg-red-600"
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
                {renderContent()}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* CSV Upload Dialog */}
      <Dialog open={isCsvDialogOpen} onOpenChange={setIsCsvDialogOpen}>
        <DialogContent className="w-[1000px] ">
          <DialogHeader>
            <DialogTitle>Upload Members via CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to add multiple members to the subteam. The CSV
              should contain columns for email, name, and role.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Drag and Drop CSV Upload Area */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select CSV File</label>
              <div
                className={`relative border-2 flex items-center justify-center border-dashed rounded-lg p-8 h-80 text-center transition-colors cursor-pointer ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : csvFile
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("csv-upload")?.click()}
              >
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-3">
                  {csvFile ? (
                    <>
                      <div className="p-3 bg-green-100 rounded-full">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">
                          {csvFile.name}
                        </p>
                        <p className="text-xs text-green-600">
                          CSV file selected successfully
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3  bg-gray-100 rounded-full">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {isDragOver
                            ? "Drop your CSV file here"
                            : "Drag & drop your CSV file here"}
                        </p>
                        <p className="text-xs text-gray-500">
                          or click to browse files
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {csvFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCsvFile(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>CSV Format Requirements:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>First row should contain column headers</li>
                <li>Required columns: email, name</li>
                <li>Optional columns: role, department</li>
                <li>Example: email,name,role</li>
                <li>Example: john@company.com,John Doe,Member</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCsvDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleCsvUpload} disabled={!csvFile}>
              Upload CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubteamDetailPage;
