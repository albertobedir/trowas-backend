"use client";

import React, { use, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronDown, PlusCircle, Search, User2, X, Plus } from "lucide-react";
import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTeamMembersStore } from "@/store/team-members-store";
import Link from "next/link";
import { Api } from "@/lib/api";
import { useUserStore } from "@/store/user-store";
import { BitPerms } from "@/utils/bitwiseperms";
import { toast } from "sonner";


// Helper function to check if a permission is locked
const isPermissionLocked = (userPermission: bigint, permission: keyof typeof BitPerms) => {
  return (BigInt(userPermission) & BitPerms[permission]) !== 0n;
};

const mocktemplate = [
  {
    id: 1,
    "templateName": "Modern Business Card Theme 1",
    "layout": "Portrait",
    "company": "Babel",
    "location": "San Francisco, CA",
    "bio": "We make excellent software.",
    "cardTheme": "#10B981",
    "linkColor": "#9db96a",
    "matchLinkIconsToTheme": true,
    "font": "Inter",
    "connectButtonLabel": "Get in Touch",
    "formDisclaimer": "We respect your privacy. Your information will never be shared.",
    "allowNonAdminsToUse": false,
  },
  {
    id: 2,
   "templateName": "Modern Business Card Theme 2",
    "layout": "Center Aligned",
    "company": "Babel",
    "location": "San Francisco, CA",
    "bio": "We make excellent software.",
    "cardTheme": "#f9d2d2",
    "linkColor": "#2563EB",
    "matchLinkIconsToTheme": true,
    "font": "Inter",
    "connectButtonLabel": "Get in Touch",
    "formDisclaimer": "We respect your privacy. Your information will never be shared.",
    "allowNonAdminsToUse": false,
  },
  {
    id: 3,
    "templateName": "Modern Business Card Theme 3",
    "layout": "Left Aligned",
    "company": "OpenAI Technologies",
    "location": "San Francisco, CA",
    "bio": "We build safe and powerful AI tools to help people and businesses.",
    "cardTheme": "#24b6f5",
    "linkColor": "#4159d2",
    "matchLinkIconsToTheme": true,
    "font": "Roboto",
    "connectButtonLabel": "Get in Touch",
    "formDisclaimer": "We respect your privacy. Your information will never be shared.",
    "allowNonAdminsToUse": false,
  },
  {
    id: 4,
    "templateName": "Modern Business Card Theme 4",
    "layout": "Portrait",
    "company": "OpenAI Technologies",
    "location": "San Francisco, CA",
    "bio": "We build safe and powerful AI tools to help people and businesses.",
    "cardTheme": "#EF4444",
    "linkColor": "#4159d2",
    "matchLinkIconsToTheme": true,
    "font": "Roboto",
    "connectButtonLabel": "Get in Touch",
    "formDisclaimer": "We respect your privacy. Your information will never be shared.",
    "allowNonAdminsToUse": false,
  },
  {
    id: 5,
    "templateName": "Modern Business Card Theme 5",
    "layout": "Left Aligned",
    "company": "OpenAI Technologies",
    "location": "San Francisco, CA",
    "bio": "We build safe and powerful AI tools to help people and businesses.",
    "cardTheme": "#F59E0B",
    "linkColor": "#3B82F6",
    "matchLinkIconsToTheme": true,
    "font": "Roboto",
    "connectButtonLabel": "Get in Touch",
    "formDisclaimer": "We respect your privacy. Your information will never be shared.",
    "allowNonAdminsToUse": false,
  }
];
// Sample data
const items = [
  {
    id: "1",
    name: "Basic Template",
    users: 12,
  },
  {
    id: "2",
    name: "Advanced Template",
    users: 8,
  },
  {
    id: "3",
    name: "Custom Template",
    users: 6,
  },
  {
    id: "4",
    name: "Legacy Template",
    users: 10,
  },
];

export default function ThemesPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [templatesData, setTemplatesData] = useState<any[]>([]);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { members, fetchMembers, isLoading } = useTeamMembersStore();
  const [selectedNonMembers, setSelectedNonMembers] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [filteredTeamMembers, setFilteredTeamMembers] = useState<any[]>([]);
  const [filteredNonTeamMembers, setFilteredNonTeamMembers] = useState<any[]>([]);
  const tableCardRef = React.useRef<HTMLDivElement>(null);
  const [selectTemplateMok, setSelectTemplateMok] = useState<typeof mocktemplate[0] | null>(null);
  const [isThemeDialogOpen, setThemeDialogOpen] = useState(false);
  const { user, fetchUser, isLoading: isUserLoading } = useUserStore();
  const [selecttempid, setSelectTempId] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!isUserLoading && user) {
        const response = await Api.get(`/templates/get-all?teamId=${user.team}`);
        if (!response.data) {
          throw new Error("Failed to fetch templates");
        }
        setTemplatesData(response.data.templates);
      }
    };
    fetchTemplates();
  }, [isUserLoading, user]);

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const selectTempData = (id: number) => {
    const selected = mocktemplate.find(temp => temp.id === id);
    if (selected) {
      setSelectTemplateMok({ ...selected }); // Deep copy tercih edebilirsin
    }
  };

  const closeSelectionMenu = () => {
    setSelectedItems([]);
  };
  const updateteammembers = (selectedMembers: any[], selectedNonMembers: any[], selecttempid: string | null) => {
    Api.patch(`/user/${user?._id}/card/assigns/${selecttempid}`, {
      remove: selectedMembers,
      add: selectedNonMembers,
    });
  };
  const handleSubmit = async () => {
    if (!selectTemplateMok) return;
    const formData = new FormData();
    formData.append("templateName", selectTemplateMok.templateName);
    formData.append("cardLayout", selectTemplateMok.layout);
    formData.append("company", selectTemplateMok.company);
    formData.append("location", selectTemplateMok.location);
    formData.append("bio", selectTemplateMok.bio);
    formData.append("colorTheme", selectTemplateMok.cardTheme);
    formData.append("linkColor", selectTemplateMok.linkColor);
    formData.append("matchLinkIconsToTheme", String(selectTemplateMok.matchLinkIconsToTheme));
    formData.append("font", selectTemplateMok.font);
    formData.append("connectButtonLabel", selectTemplateMok.connectButtonLabel);
    formData.append("formDisclaimer", selectTemplateMok.formDisclaimer);
    formData.append("allowNonAdminsToUse", String(selectTemplateMok.allowNonAdminsToUse));
    formData.append("links", "");

    try {
      const response = await Api.post("/templates/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201) {
        console.log("Template created successfully:", response.data);
        // Redirect or show success message
        window.location.href = `/themes/${response.data.data._id}`;
      } else {
        console.error("Error creating template:", response.data);
      }
    } catch (error) {
      console.error("API Hatası:", error);
    }
  };

  const handleSelectAllMembers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMembers(filteredTeamMembers.map(member => member._id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectAllNonMembers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedNonMembers(filteredNonTeamMembers.map(member => member._id));
    } else {
      setSelectedNonMembers([]);
    }
  };

  const toggleMemberSelection = (memberId: string, isTeamMember: boolean) => {
    if (isTeamMember) {
      setSelectedMembers(prev =>
        prev.includes(memberId)
          ? prev.filter(id => id !== memberId)
          : [...prev, memberId]
      );
    } else {
      setSelectedNonMembers(prev =>
        prev.includes(memberId)
          ? prev.filter(id => id !== memberId)
          : [...prev, memberId]
      );
    }
  };
  console.log("Templates Data:", templatesData);

  // Fetch team members

  return (
    <div className="w-full">
      <div className="p-3">
        <div className="h-full w-full">
          <div className="mx-auto py-6 px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Templates</h1>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-full">
                  {user?.roles?.teamRole !== "member" && (
                    <Button
                      onClick={() => setThemeDialogOpen(true)}
                      size="sm"
                      className="rounded-full flex-1 md:flex-none"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Template
                    </Button>
                  )}
                  <Dialog
                    open={isThemeDialogOpen}
                    onOpenChange={setThemeDialogOpen}
                  >
                    <DialogContent className="sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[1200px] w-[95vw] max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="text-center mb-4">
                        <DialogTitle className="text-3xl font-bold">
                          Pick a Card Template
                        </DialogTitle>
                        <p className="text-muted-foreground mt-2">
                          Choose a digital business card template that matches
                          your brand and style.
                        </p>
                      </DialogHeader>

                      <div className="py-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                          {/* Card Template 1 */}
                          <div onClick={() => selectTempData(1)} className="border rounded-[27px] overflow-hidden hover:border-primary cursor-pointer transition-all items-center justify-center flex flex-col">
                            <div style={{ backgroundImage: "url(/theme1.png)" }} className="relative
                             w-full h-full bg-cover">

                            </div>
                          </div>

                          {/* Card Template 2 */}
                          <div onClick={() => selectTempData(2)} className="border rounded-[27px] overflow-hidden hover:border-primary cursor-pointer transition-all items-center justify-center flex flex-col">
                            <div style={{ backgroundImage: "url(/theme2.png)" }} className="relative
                             w-full h-full bg-cover">

                            </div>
                          </div>

                          {/* Card Template 3 */}
                          <div onClick={() => selectTempData(3)} className="border rounded-[27px] h-full overflow-hidden hover:border-primary cursor-pointer transition-all items-center justify-center flex flex-col">
                            <div style={{ backgroundImage: "url(/theme3.png)" }} className="relative
                             w-full h-full bg-cover">

                            </div>
                          </div>

                          {/* Card Template 4 */}
                          <div onClick={() => selectTempData(4)} className="border rounded-[27px] overflow-hidden hover:border-primary cursor-pointer transition-all items-center justify-center flex flex-col">
                            <div style={{ backgroundImage: "url(/theme4.png)" }} className="relative
                             w-full h-full bg-cover">

                            </div>
                          </div>

                          {/* Card Template 5 */}
                          <div onClick={() => selectTempData(5)} className="border rounded-[27px] overflow-hidden hover:border-primary h-[444px] cursor-pointer transition-all items-center justify-center flex flex-col">
                            <div style={{ backgroundImage: "url(/theme5.png)" }} className="relative
                             w-full h-full bg-cover">

                            </div>
                          </div>
                        </div>


                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setThemeDialogOpen(false)}
                          className="mr-2"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          className="px-6"
                          disabled={!selectTemplateMok}
                        >
                          Use This Template
                        </Button>
                      </DialogFooter>
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
                  placeholder="Search templates..."
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
                              <span className="text-sm font-medium ml-4">
                                Template Info
                              </span>
                            </TableHead>
                            <TableHead style={{ width: "15%" }}>
                              Template
                            </TableHead>
                            <TableHead
                              className="text-right"
                              style={{ width: "20%" }}
                            >
                              Members
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {templatesData.map((template) => (
                            <motion.tr
                              key={template._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                              className="h-[90px] group hover:bg-accent/50 transition-colors cursor-pointer"
                            >
                              <TableCell>
                                <div className="flex items-center gap-4 ml-4">
                                  <div className="relative w-[145px] h-[58px] rounded-lg overflow-hidden bg-gray-100">
                                    <Image
                                      src={template.coverPhoto || "/templates_cover.png"}
                                      alt="Template Cover"
                                      fill
                                      className="object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Image
                                        src={template.companyLogo || "/company_logo.png"}
                                        alt="Company Logo"
                                        width={40}
                                        height={40}
                                        className="object-contain rounded-full"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-base">
                                      {template.templateName}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (user?.roles.teamRole === "member") {
                                      toast("You do not have permission", {
                                        description: "Please contact your team manager.",
                                        action: {
                                          label: "Undo",
                                          onClick: () => console.log("Undo"),
                                        },
                                      })
                                      return;
                                    } else {
                                      window.location.href = `/themes/${template._id}`;
                                    }
                                  }}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full"
                                  >
                                    Edit Template
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (user?.roles.teamRole === "member") {
                                        toast("You do not have permission", {
                                          description: "Please contact your team manager.",
                                          action: {
                                            label: "Undo",
                                            onClick: () => console.log("Undo"),
                                          },
                                        })
                                        return;
                                      }
                                      else {
                                        setSelectTempId(template._id);
                                        setIsMemberDialogOpen(true);
                                      }
                                    }}
                                  >
                                    {template.members.length} Members
                                    <Plus className="h-3.5 w-3.5" />
                                  </Button>
                                </div>

                                <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Manage Template Members</DialogTitle>
                                    </DialogHeader>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {/* Part of Template Table */}
                                      <div className="border border-gray-100 rounded-lg overflow-hidden">
                                        <div className="p-3 flex items-center justify-between bg-white">
                                          <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-medium">Template Members</h3>
                                            <span className="text-xs bg-gray-100 text-gray-600 py-0.5 px-1.5 rounded-full">
                                              ({template.members.length})
                                            </span>
                                          </div>
                                          <div className="flex items-center">
                                            <input
                                              type="checkbox"
                                              id="selectAll1"
                                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                              checked={selectedMembers.length === filteredTeamMembers.length && filteredTeamMembers.length > 0}
                                              onChange={handleSelectAllMembers}
                                            />
                                            <label htmlFor="selectAll1" className="ml-2 text-xs text-gray-600">
                                              Select All
                                            </label>
                                          </div>
                                        </div>
                                        <Table>
                                          <TableBody>
                                            {members
                                              .filter((member) => template.members && template.members.includes(member._id))
                                              .map((member) => (
                                                <TableRow key={member._id}>
                                                  <TableCell className="py-3">
                                                    <div className="flex items-center gap-3">
                                                      <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300"
                                                        checked={selectedMembers.includes(member._id)}
                                                        onChange={() => toggleMemberSelection(member._id, true)}
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
                                                        <h4 className="text-sm font-medium">{member.name}</h4>
                                                        <p className="text-xs text-gray-500">{member.email}</p>
                                                      </div>
                                                    </div>
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            {template.members.length === 0 && (
                                              <TableRow>
                                                <TableCell colSpan={2} className="text-center py-6">
                                                  <p className="text-sm text-gray-500">No template members</p>
                                                </TableCell>
                                              </TableRow>
                                            )}
                                          </TableBody>
                                        </Table>
                                      </div>

                                      {/* Available Members Table */}
                                      <div className="border border-gray-100 rounded-lg overflow-hidden">
                                        <div className="p-3 flex items-center justify-between bg-white">
                                          <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-medium">Available Members</h3>
                                            <span className="text-xs bg-gray-100 text-gray-600 py-0.5 px-1.5 rounded-full">
                                              ({members
                                                .filter((member) => template.members && !template.members.includes(member._id))
                                                .length})
                                            </span>
                                          </div>
                                          <div className="flex items-center">
                                            <input
                                              type="checkbox"
                                              id="selectAll2"
                                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                              checked={selectedNonMembers.length === filteredNonTeamMembers.length && filteredNonTeamMembers.length > 0}
                                              onChange={handleSelectAllNonMembers}
                                            />
                                            <label htmlFor="selectAll2" className="ml-2 text-xs text-gray-600">
                                              Select All
                                            </label>
                                          </div>
                                        </div>
                                        <Table>
                                          <TableBody>
                                            {members
                                              .filter((member) => template.members && !template.members.includes(member._id))
                                              .map((member) => (
                                                <TableRow key={member._id}>
                                                  <TableCell className="py-3">
                                                    <div className="flex items-center gap-3">
                                                      <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300"
                                                        checked={selectedNonMembers.includes(member._id)}
                                                        onChange={() => toggleMemberSelection(member._id, false)}
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
                                                        <h4 className="text-sm font-medium">{member.name}</h4>
                                                        <p className="text-xs text-gray-500">{member.email}</p>
                                                      </div>
                                                    </div>
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            {members
                                              .filter((member) => template.members && !template.members.includes(member._id)).length === 0 && (
                                                <TableRow>
                                                  <TableCell colSpan={2} className="text-center py-6">
                                                    <p className="text-sm text-gray-500">No available members</p>
                                                  </TableCell>
                                                </TableRow>
                                              )}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>

                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsMemberDialogOpen(false)}>
                                        Cancel
                                      </Button>
                                      <Button onClick={() => {
                                        // Handle saving member changes here
                                        console.log("Selected Members:", selectedMembers);
                                        console.log("Selected Non-Members:", selectedNonMembers);
                                        updateteammembers(selectedMembers, selectedNonMembers, selecttempid);
                                        setIsMemberDialogOpen(false);
                                      }}>
                                        Save Changes
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
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
