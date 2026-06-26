import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Api } from "@/lib/api";
import { useRouter } from "next/navigation";
import LiveTemplatePreview from "@/components/ui/live-template-preview";

interface Template {
  _id: string;
  templateName: string;
  cardLayout: string;
  cardTheme?: string;
  profilePicture: string;
  coverPhoto: string;
  companyLogo: string;
  company: string;
  location: string;
  bio: string;
  linkColor: string;
  matchLinkIconsToTheme: boolean;
  font: string;
  links: {
    links: {
      linkOrder: string[];
      activeLinks: {
        singleLink: boolean;
        [key: string]: boolean;
      };
      userLinks: {
        [key: string]: {
          type: string;
          username: string;
          title: string;
          url: string;
        };
      };
    };
  };
}

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelect: (templateId: string) => void;
  currentTemplateId?: string;
  userteamid?: string;

  // ❌ eski: memberId?: string;
  // ✅ yeni:
  memberId?: string | string[];
}
/*
const templates: Template[] = [
  { id: "no-template", name: "No template" },
  { id: "template-5-1", name: "Template 5", logo: "/popl.png" },
  { id: "template-5-2", name: "Template 5", logo: "/popl.png" },
  { id: "template-4", name: "Template 4", logo: "/popl.png" },
  { id: "template-3", name: "Template 3", logo: "/popl.png" },
  { id: "babel", name: "BABEL", logo: "/babel.png" },
  { id: "admin", name: "Admin Template", logo: "/popl.png", isAdmin: true },
];
*/
export function TemplateSelectionDialog({
  open,
  onOpenChange,
  onTemplateSelect,
  currentTemplateId = "template-3",
  userteamid,
  memberId,
}: TemplateSelectionDialogProps) {
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string>(currentTemplateId);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplateId(template._id);
    setSelectedTemplate(template);
  };
  const { mutate } = useMutation({
    mutationFn: async (selectedTemplateId: string) => {
      const formData = new FormData();
      formData.append("teamTemplateId", selectedTemplateId);

      const ids = Array.isArray(memberId)
        ? memberId
        : memberId
          ? [memberId]
          : [];

      if (ids.length === 0) {
        throw new Error("No member selected");
      }

      const results = await Promise.allSettled(
        ids.map((id) =>
          Api.patch(`/user/${id}/card/update`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }),
        ),
      );

      return results;
    },
  });

  const handleAssign = () => {
    mutate(selectedTemplateId);
    onTemplateSelect(selectedTemplateId);
    onOpenChange(false);
  };

  const handleUnassign = () => {
    onTemplateSelect("no-template");
    setSelectedTemplateId("no-template");
    onOpenChange(false);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["userTeam"],
    queryFn: async () => {
      const response = await Api.get(`/templates/get-all?teamId=${userteamid}`);
      if (!response) {
        return [];
      }
      setTemplateList(response.data.templates);
      return response.data;
    },
    enabled: !!userteamid,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] rounded-3xl p-0 overflow-hidden">
        <div className="flex flex-col rounded-3xl h-[750px]">
          <DialogTitle className="p-6 pb-4 flex items-center justify-between">
            <p className="text-xl font-semibold">Choose a Template</p>
          </DialogTitle>

          <div className="flex flex-1 overflow-hidden">
            {/* Left side - Template list */}
            <div className="w-2/5 border-r overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-3">
                {!isLoading &&
                  templateList.map((template: Template) => (
                    <div
                      key={template._id}
                      onClick={() => handleSelectTemplate(template)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                        selectedTemplateId === template._id
                          ? "bg-slate-100"
                          : "hover:bg-slate-50",
                      )}
                    >
                      {template._id === "no-template" ? (
                        <div className="w-10 h-10 border rounded-full flex items-center justify-center">
                          <User2 className="h-5 w-5 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 relative">
                          <Image
                            src={template.companyLogo || "/popl.png"}
                            alt={template.templateName}
                            className="rounded-full"
                            fill
                            sizes="40px"
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {template.templateName}
                        </span>{" "}
                        <span className="text-xs text-gray-500">
                          {template.cardLayout || "Standard Layout"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            {/* Right side - Live Template preview */}
            <div className="w-3/5 p-6 flex flex-col items-center justify-center bg-gray-50 custom-scrollbar">
              {" "}
              {selectedTemplate ? (
                <LiveTemplatePreview
                  template={{
                    id: selectedTemplate._id,
                    name: selectedTemplate.templateName,
                    layout: selectedTemplate.cardLayout as
                      | "Center Aligned"
                      | "Left Aligned"
                      | "Portrait",
                    cardTheme:
                      selectedTemplate.cardTheme ||
                      (selectedTemplate.cardLayout === "Center Aligned"
                        ? "#FFFFFF"
                        : selectedTemplate.cardLayout === "Left Aligned"
                          ? "#F8FAFC"
                          : selectedTemplate.cardLayout === "Portrait"
                            ? "#F3F4F6"
                            : "#DBEAFE"),
                    font: selectedTemplate.font || "Inter",
                    linkColor: selectedTemplate.linkColor || "#3B82F6",
                  }}
                  profileData={{
                    name: "John Doe",
                    jobTitle: "Product Manager",
                    company: selectedTemplate.company || "Tech Corp",
                    location: selectedTemplate.location || "San Francisco, CA",
                    bio:
                      selectedTemplate.bio ||
                      "Passionate about creating innovative solutions that make a difference. Always learning and growing in the tech space.",
                  }}
                  profileImage={
                    selectedTemplate.profilePicture || "/defaultpp.png"
                  }
                  coverImage={selectedTemplate.coverPhoto}
                  companyLogo={
                    selectedTemplate.companyLogo || "/company_logo.png"
                  }
                  activeLinks={
                    selectedTemplate.links?.links?.activeLinks || {
                      linkedin: true,
                      twitter: true,
                      email: true,
                      website: true,
                    }
                  }
                  linkOrder={
                    selectedTemplate.links?.links?.linkOrder || [
                      "linkedin",
                      "twitter",
                      "email",
                      "website",
                    ]
                  }
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <User2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Template Selected
                    </h3>
                    <p className="text-gray-500">
                      Select a template to see the live preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t p-4 flex justify-end items-center">
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="rounded-full">
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleAssign} className="rounded-full">
                İmport to Card
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
