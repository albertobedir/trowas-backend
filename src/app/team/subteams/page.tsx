"use client";

import React, { useEffect, useMemo } from "react";
import { toast } from "sonner";
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
import {
  Check,
  ChevronDown,
  DeleteIcon,
  GrabIcon,
  PlusCircle,
  RemoveFormatting,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Api } from "@/lib/api";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/user-store";
import { useTeamMembersStore } from "@/store/team-members-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePageLoading } from "@/hooks/use-page-loading";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { SubadminDialog } from "@/components/subadmin-dialog";
import { LuUser } from "react-icons/lu";

// Mock user data for admin selection
const mockUsers = [
  {
    id: "1",
    name: "Alex Thompson",
    avatar:
      "https://res.cloudinary.com/dlzlfasou/image/upload/v1736358071/avatar-40-02_upqrxi.jpg",
  },
  {
    id: "2",
    name: "Sarah Chen",
    avatar:
      "https://res.cloudinary.com/dlzlfasou/image/upload/v1736358073/avatar-40-01_ij9v7j.jpg",
  },
  {
    id: "3",
    name: "Maria Garcia",
    avatar:
      "https://res.cloudinary.com/dlzlfasou/image/upload/v1736358072/avatar-40-03_dkeufx.jpg",
  },
  {
    id: "4",
    name: "David Kim",
    avatar:
      "https://res.cloudinary.com/dlzlfasou/image/upload/v1736358070/avatar-40-05_cmz0mg.jpg",
  },
  {
    id: "5",
    name: "Emily Johnson",
    avatar:
      "https://res.cloudinary.com/dlzlfasou/image/upload/v1736358071/avatar-40-02_upqrxi.jpg",
  },
  {
    id: "6",
    name: "Michael Brown",
    avatar:
      "https://res.cloudinary.com/dlzlfasou/image/upload/v1736358073/avatar-40-01_ij9v7j.jpg",
  },
];

const items = [
  {
    id: "1",
    name: "Development Team",
    image:
      "https://res.cloudinary.com/dlzlfasou/image/upload/v1736358071/avatar-40-02_upqrxi.jpg",
    admin: "Alex Thompson",
    members: "12 Members",
  },
  {
    id: "2",
    name: "Design Team",
    image:
      "https://res.cloudinary.com/dlzlfasou/image/upload/v1736358073/avatar-40-01_ij9v7j.jpg",
    admin: "Sarah Chen",
    members: "8 Members",
  },
  {
    id: "3",
    name: "Marketing Team",
    image:
      "https://res.cloudinary.com/dlzlfasou/image/upload/v1736358072/avatar-40-03_dkeufx.jpg",
    admin: "Maria Garcia",
    members: "6 Members",
  },
  {
    id: "4",
    name: "Sales Team",
    image:
      "https://res.cloudinary.com/dlzlfasou/image/upload/v1736358070/avatar-40-05_cmz0mg.jpg",
    admin: "David Kim",
    members: "10 Members",
  },
];

interface SubteamFormData {
  name: string;
  description: string;
  permissions: number;
}

interface Subteam {
  _id: string;
  name: string;
  description: string;
  logo: string;
  members: string[];
  admins: string[];
  owner: string;
}

interface TeamMember {
  profileImage: string;
  _id: string;
  name: string;
  avatar?: string;
}

export default function SubteamsPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [subteamlistData, setSubteamlistData] = useState<Subteam[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const isLoading = usePageLoading();
  const { user, fetchUser, isLoading: isUserLoading } = useUserStore();
  const { members: teamMembers, fetchMembers: fetchTeamMembers } =
    useTeamMembersStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [selectedSubadmins, setSelectedSubadmins] = useState<string[]>([]);
  const [isSubadminDialogOpen, setIsSubadminDialogOpen] = useState(false);
  const [currentSubteamId, setCurrentSubteamId] = useState<string>("");

  useEffect(() => {
    fetchUser();
    fetchTeamMembers();
  }, [fetchUser, fetchTeamMembers]);

  const toggleSubadmin = (userId: string) => {
    setSelectedSubadmins((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSaveSubadmins = async () => {
    try {
      const data = new URLSearchParams();
      data.append("admins", JSON.stringify(selectedSubadmins));

      await Api.patch(`/subteam/${currentSubteamId}/update`, data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // Update the local state
      setSubteamlistData((prev) =>
        prev.map((team) =>
          team._id === currentSubteamId
            ? { ...team, admins: selectedSubadmins }
            : team,
        ),
      );
    } catch (error) {
      console.error("Failed to update subadmins:", error);
      // Here you might want to show an error message to the user
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubteamFormData>({
    defaultValues: {
      name: "",
      description: "",
      permissions: 0,
    },
  });
  useEffect(() => {
    // Fetch user data from the global store if not already loaded
    fetchUser();
  }, [fetchUser]);
  useEffect(() => {
    const fetchSubteamlistData = async () => {
      if (!isUserLoading && user) {
        const response = await Api.get(`/subteam/get-all?teamId=${user.team}`);
        if (!response.data) {
          throw new Error("Failed to fetch subteam list");
        }
        // Assuming the response data is an array of subteams
        // You can set the state with the fetched data
        setSubteamlistData(response.data.subTeams);
      }
    };
    fetchSubteamlistData();
  }, [isUserLoading, user]);

  const router = useRouter();
  const tableCardRef = React.useRef<HTMLDivElement>(null);

  const toggleSelectAll = () => {
    if (filteredSubteams === null) return;
    // Check if all visible (filtered) items are selected
    const visibleItemIds = filteredSubteams.map(
      (item: { _id: string }) => item._id,
    );
    const allVisibleSelected = visibleItemIds.every((id) =>
      selectedItems.includes(id),
    );

    if (allVisibleSelected) {
      // Deselect all visible items
      setSelectedItems((prev) =>
        prev.filter((id) => !visibleItemIds.includes(id)),
      );
    } else {
      // Select all visible items (keeping already selected items from other filters)
      setSelectedItems((prev) => [...new Set([...prev, ...visibleItemIds])]);
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const closeSelectionMenu = () => {
    setSelectedItems([]);
  };

  const handleAdminChange = (subteamId: string, adminName: string) => {
    // Here you would typically update this in your backend
    console.log(`Setting ${adminName} as admin for subteam ${subteamId}`);
  };

  // Filter subteams based on search query
  const filteredSubteams = useMemo(() => {
    if (!searchQuery.trim()) {
      return subteamlistData;
    }

    return subteamlistData.filter(
      (subteam) =>
        subteam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subteam.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [subteamlistData, searchQuery]);

  if (isLoading || isUserLoading) {
    return <PageSkeleton variant="simple" />;
  }

  return (
    <div className="w-full">
      <div className="p-3">
        <div className="h-full w-full">
          <div className="mx-auto py-6 px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Subteams</h1>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-full">
                  {user?.roles?.teamRole !== "member" && (
                    <Button
                      size="sm"
                      className="rounded-full flex-1 md:flex-none"
                      onClick={() => {
                        if (
                          user?.roles?.teamRole === "manager" ||
                          user?.roles?.teamRole === "owner"
                        ) {
                          setIsAddDialogOpen(true);
                        } else {
                          toast("You do not have permission", {
                            description: "Please contact your team manager.",
                            action: {
                              label: "Undo",
                              onClick: () => console.log("Undo"),
                            },
                          });
                        }
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Subteam
                    </Button>
                  )}

                  <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={(open) => {
                      if (!open) {
                        reset();
                        setLogoFile(null);
                      }
                      setIsAddDialogOpen(open);
                    }}
                  >
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                          Add New Subteam
                        </DialogTitle>
                      </DialogHeader>

                      <form
                        onSubmit={handleSubmit(async (data) => {
                          try {
                            // Create FormData to handle file upload
                            const formData = new FormData();

                            // Add all form fields
                            formData.append("name", data.name);
                            formData.append("description", data.description);
                            formData.append("permissions", "0");

                            // Add logo if available
                            if (logoFile) {
                              formData.append("logo", logoFile);
                            }

                            // Send data to API using axios api.patch
                            const response = await Api.post(
                              "/subteam/create",
                              formData,
                              {
                                headers: {
                                  "Content-Type": "multipart/form-data",
                                },
                              },
                            );

                            if (!response.data) {
                              throw new Error("Failed to create subteam");
                            }

                            // Close dialog and reset form
                            setIsAddDialogOpen(false);
                            reset();
                            setLogoFile(null);
                            window.location.reload();

                            // You could add a success notification here
                          } catch (error) {
                            console.error("Error creating subteam:", error);
                            // You could add an error notification here
                          }
                        })}
                      >
                        <div className="py-4 space-y-4">
                          {/* Logo upload */}
                          <div className="flex flex-col gap-2">
                            <label
                              htmlFor="logo-upload"
                              className="text-sm font-medium"
                            >
                              Subteam Logo
                            </label>
                            <label htmlFor="logo-upload" className="w-full">
                              <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary transition-colors">
                                {logoFile ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <Image
                                      src={URL.createObjectURL(logoFile)}
                                      alt="Logo preview"
                                      width={80}
                                      height={80}
                                      className="w-20 h-20 rounded-full object-cover"
                                    />
                                    <span className="text-sm text-gray-500">
                                      {logoFile.name}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <PlusCircle className="h-10 w-10 text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                      Upload team logo
                                    </span>
                                  </div>
                                )}
                                <input
                                  id="logo-upload"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setLogoFile(file);
                                  }}
                                />
                              </div>
                            </label>
                          </div>

                          {/* Subteam Name */}
                          <div className="space-y-2">
                            <label
                              htmlFor="name"
                              className="text-sm font-medium"
                            >
                              Subteam Name
                            </label>
                            <Input
                              id="name"
                              placeholder="Enter subteam name"
                              {...register("name", {
                                required: "Subteam name is required",
                              })}
                            />
                            {errors.name && (
                              <p className="text-sm text-red-500">
                                {errors.name.message}
                              </p>
                            )}
                          </div>

                          {/* Subteam Description */}
                          <div className="space-y-2">
                            <label
                              htmlFor="description"
                              className="text-sm font-medium"
                            >
                              Subteam Description
                            </label>
                            <Input
                              id="description"
                              placeholder="Enter subteam description"
                              {...register("description")}
                            />
                          </div>

                          {/* Hidden permissions field */}
                          <input
                            type="hidden"
                            {...register("permissions")}
                            value={0}
                          />
                        </div>

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAddDialogOpen(false);
                              reset();
                              setLogoFile(null);
                            }}
                            className="mr-2"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Add Subteam"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
            <div className="space-y-3 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="w-full rounded-full bg-white pl-10"
                  placeholder="Search subteams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Card
                ref={tableCardRef}
                className="w-full border rounded-lg overflow-hidden"
              >
                <ScrollArea className="w-full" style={{ maxWidth: "100%" }}>
                  <div className="p-3">
                    <div style={{ minWidth: "100%" }}>
                      <Table>
                        <TableHeader>
                          <TableRow className="h-[48px]">
                            <TableHead className="w-[300px]">
                              <div className="flex items-center gap-4">
                                <Checkbox
                                  checked={
                                    filteredSubteams.length > 0 &&
                                    filteredSubteams.every((item) =>
                                      selectedItems.includes(item._id),
                                    )
                                  }
                                  onCheckedChange={toggleSelectAll}
                                  className="ml-4 data-[state=checked]:bg-black data-[state=checked]:border-black"
                                />
                                <span className="text-sm font-medium">
                                  Select All
                                </span>
                              </div>
                            </TableHead>
                            <TableHead style={{ width: "20%" }}>
                              Subteam Admin
                            </TableHead>
                            <TableHead
                              className="text-right"
                              style={{ width: "15%" }}
                            >
                              Members
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSubteams &&
                            filteredSubteams.map((item) => (
                              <motion.tr
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                }}
                                className="h-[90px] group hover:bg-accent/50 transition-colors"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-4 ml-4">
                                    <Checkbox
                                      checked={selectedItems.includes(item._id)}
                                      onCheckedChange={() =>
                                        toggleSelectItem(item._id)
                                      }
                                      className="data-[state=checked]:bg-black data-[state=checked]:border-black transition-all duration-200 group-hover:border-black"
                                    />
                                    <div className="flex items-center gap-4">
                                      <motion.img
                                        whileHover={{ scale: 1.1 }}
                                        className="w-14 h-14 rounded-full object-cover"
                                        src={item.logo}
                                        width={56}
                                        height={56}
                                        alt={item.name}
                                      />{" "}
                                      <div
                                        onClick={() => {
                                          if (
                                            item.admins?.includes(user?._id) ||
                                            item.owner === user?._id
                                          ) {
                                            router.push(
                                              `/team/subteams/${item._id}`,
                                            );
                                          } else {
                                            toast(
                                              "You do not have permission",
                                              {
                                                description:
                                                  "Please contact your team manager.",
                                                action: {
                                                  label: "Undo",
                                                  onClick: () =>
                                                    console.log("Undo"),
                                                },
                                              },
                                            );
                                          }
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <div className="font-medium text-base hover:text-blue-600 transition-colors">
                                          {item.name}
                                        </div>
                                        <span className="mt-1 text-sm text-muted-foreground">
                                          {item.description}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>

                                <TableCell className="text-sm">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full"
                                    onClick={() => {
                                      if (
                                        user?.roles?.teamRole === "manager" ||
                                        user?.roles?.teamRole === "owner"
                                      ) {
                                        setCurrentSubteamId(item._id);
                                        setSelectedSubadmins(item.admins || []);
                                        setIsSubadminDialogOpen(true);
                                      } else {
                                        toast("You dont have permission", {
                                          description:
                                            "Please contact your team manager.",
                                          action: {
                                            label: "Undo",
                                            onClick: () => console.log("Undo"),
                                          },
                                        });
                                      }
                                    }}
                                  >
                                    Select Subadmins
                                  </Button>

                                  <SubadminDialog
                                    isOpen={isSubadminDialogOpen}
                                    onOpenChange={setIsSubadminDialogOpen}
                                    users={teamMembers
                                      .filter((member: TeamMember) =>
                                        item.members.includes(member._id),
                                      )
                                      .map((member: TeamMember) => ({
                                        id: member._id,
                                        name: member.name,
                                        avatar:
                                          member.profileImage ||
                                          "/defaultpp.png",
                                      }))}
                                    selectedSubadmins={selectedSubadmins}
                                    onToggleSubadmin={toggleSubadmin}
                                    onSave={handleSaveSubadmins}
                                  />
                                </TableCell>
                                <TableCell className="text-right ">
                                  <span className="inline-flex items-center rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-black/70">
                                    <LuUser className="h-4 w-4 text-muted-foreground mr-2" />
                                    {item.members.length}
                                  </span>
                                </TableCell>
                              </motion.tr>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
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
                    className="fixed bottom-0 h-[60px] bg-black text-white flex items-center"
                    style={{
                      left:
                        tableCardRef.current?.getBoundingClientRect().left ??
                        "calc(270px + 1.5rem)",
                      width: tableCardRef.current?.offsetWidth,
                      borderRadius: "12px 12px 0 0",
                      padding: "0 0.75rem",
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/70">
                          {selectedItems.length} Selected
                        </span>

                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={async () => {
                            try {
                              if (!user?.team || selectedItems.length === 0)
                                return;

                              const response = await Api.post(
                                `/subteam/delete-subteams`,
                                {
                                  teamId: user.team,
                                  subTeamIds: selectedItems,
                                },
                              );

                              toast.success(
                                response.data.message || "Subteams deleted",
                              );

                              // UI güncelle
                              setSubteamlistData((prev) =>
                                prev.filter(
                                  (item) => !selectedItems.includes(item._id),
                                ),
                              );

                              // selection temizle
                              setSelectedItems([]);
                            } catch (error) {
                              console.error(error);
                              toast.error("Failed to delete subteams");
                            }
                          }}
                          className="h-9 px-2.5 ml-3 text-sm font-medium text-red-500 hover:text-white hover:bg-white/20 whitespace-nowrap transition-all duration-200 flex items-center gap-2 rounded-md"
                        >
                          <DeleteIcon className="h-[15px] text-red-500 w-[15px] -translate-y-[0.5px]" />
                          Remove
                        </motion.button>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                        className="text-white hover:text-white p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
                        onClick={closeSelectionMenu}
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
