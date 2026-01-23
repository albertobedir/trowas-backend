"use client";

import React, { useState, use, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useParams } from "next/navigation";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { CropImageDialog } from "@/components/ui/CropImageDialog";
import { TemplateSelectionDialog } from "@/components/ui/template-selection-dialog";
import {
  User2,
  Link as LinkIcon,
  FileText,
  Mail,
  QrCode,
  Image as ImageIcon,
  Mail as MailIcon,
  Package,
  ArrowLeft,
  ChevronDown,
  MoreHorizontal,
  Settings,
  LogOut,
  UserPlus,
  Upload,
  Crop as CropIcon,
  X,
  Check,
  Plus,
  Search,
  MessageSquare,
  Phone,
  MapPin,
  ExternalLink,
  Globe,
  Instagram as InstagramIcon,
  Video,
  Pencil,
  Trash2,
  Info,
  AlignLeft,
  Type as TextIcon,
  Download,
  CheckSquare,
  AtSign,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { LinkCard } from "@/components/ui/LinkCard";
import { LinksCategoryModal } from "@/components/ui/LinksCategoryModalTemp";
import LinkEditingDialog from "@/components/ui/LinkEditingDialog";
import { set } from "mongoose";
import LeadCaptureViewCard from "./LeadCaptureViewCard";
import EmailPreview from "./EmailPreview";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VirtualBackground from "@/components/virtual-background/virtual-background";
import VirtualBackgroundPreview from "@/components/virtual-background/virtual-background-preview";
import { z } from "zod";
import { UserCardUpdateSchema } from "@/schemas/zod/user";
import { ThemePageSkeleton } from "@/components/ui/loading-spinner";
import { MdCall, MdEmail, MdSave } from "react-icons/md";

const MemberDetailPage = () => {
  const pathname = usePathname();
  const params = useParams();

  // Access memberId from useParams hook
  const themeId = params.themeId as string;

  const { data, isPending, isError } = useQuery({
    queryKey: ["member", themeId],
    queryFn: async () => {
      if (themeId) {
        const response = await Api.get(`/templates/${themeId}`);
        console.log("API Response:", response);
        return response;
      }
      return null;
    },
    enabled: !!themeId,
    retry: false,
  });
  // Define a default member object that will be replaced with API data when it loads
  const defaultMember = {
    id: themeId,
    name: "",
    username: "",
    image:
      "https://res.cloudinary.com/dlzlfasou/image/upload/v1736358071/avatar-40-02_upqrxi.jpg",
    email: "",
    location: "",
    status: "Active",
    balance: "",
    bio: "",
    joined: "",
    links: {
      website: "",
      linkedin: "",
      twitter: "",
    },
  };

  // Use the API data or default values if data is not loaded yet
  const member = data?.data?.template || defaultMember;

  const linkData = data?.data?.template.links.links;
  const [activeTab, setActiveTab] = useState("about");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState("template-3");
  const [matchLinkToTheme, setMatchLinkToTheme] = useState(true);
  // Colors for theme and links
  const colorOptions = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];
  const [selectedCardTheme, setSelectedCardTheme] = useState(colorOptions[0]);
  const [selectedLinkColor, setSelectedLinkColor] = useState(colorOptions[0]);
  // Layout and font selections
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [profileImage, setProfileImage] = useState<string>("/defaultpp.png");
  const [coverImage, setCoverImage] = useState<string>("");

  // Default values for lead capture form settings
  const defaultFormHeader = `Share your info back with Copy of Faruk`;
  const defaultConnectButtonText = "Connect";
  const defaultFormDisclaimer = "Your data is private and secure";

  // Lead capture form header
  const [formHeader, setFormHeader] = useState(defaultFormHeader);

  // Connect button text
  const [connectButtonText, setConnectButtonText] = useState(
    defaultConnectButtonText
  );

  // Form disclaimer text
  const [formDisclaimer, setFormDisclaimer] = useState(defaultFormDisclaimer);

  // Follow-up email settings
  const [emailSubject, setEmailSubject] = useState("Copy of Faruk <> Lead's First Name");
  const [emailGreeting, setEmailGreeting] = useState("Hi Copy of Faruk and");
  const [emailBody, setEmailBody] = useState("You both just connected via Popl and this is an automatic email intro.\n\nReply to this email to continue the conversation.");

  // Lead capture enabled state
  const [isLeadCaptureEnabled, setIsLeadCaptureEnabled] = useState(false);

  // State for storing the order of links (for drag and drop functionality)
  const [linkOrder, setLinkOrder] = useState<string[]>([]);

  // Define type for hidden fields
  type HiddenFieldType = {
    id: number;
    title: string;
    value: string;
  };

  // Hidden fields management - start with empty array
  const [hiddenFields, setHiddenFields] = useState<HiddenFieldType[]>([]);

  // Function to add a new hidden field
  const addHiddenField = () => {
    const newId =
      hiddenFields.length > 0
        ? Math.max(...hiddenFields.map((field) => field.id)) + 1
        : 1;

    setHiddenFields([...hiddenFields, { id: newId, title: "", value: "" }]);
  };

  // Function to remove a hidden field
  const removeHiddenField = (id: number) => {
    setHiddenFields(hiddenFields.filter((field) => field.id !== id));
  };

  // Function to update a hidden field
  const updateHiddenField = (id: number, updates: Partial<HiddenFieldType>) => {
    setHiddenFields(
      hiddenFields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  // Function to handle saving lead capture form data
  const handleLeadCaptureFormSave = () => {
    try {
      console.log("Save button clicked - preparing data...");

      // Track removed fields by comparing with initial fields
      const initialFieldIds =
        data?.data?.template?.leadCaptureFields?.map(
          (field: any) => field.id
        ) || [];

      const removedFieldIds = initialFieldIds.filter(
        (id: number) => !leadCaptureFields.some((field) => field.id === id)
      );

      // Create detailed fields data including required status
      const fieldsData = leadCaptureFields.map((field) => ({
        id: field.id,
        name: field.name,
        type: field.type,
        required: field.required,
        options: field.options || [],
      }));

      // Prepare form data for saving in a backend-ready format
      const formData = {
        settings: {
          isEnabled: isLeadCaptureEnabled,
          formHeader: formHeader,
          connectButtonText: connectButtonText,
          formDisclaimer: formDisclaimer,
        },
        fields: fieldsData,
        hiddenFields: hiddenFields,
        meta: {
          fieldCount: leadCaptureFields.length,
          removedFieldIds: removedFieldIds,
          fieldOrder: leadCaptureFields.map((field) => field.id),
        },
      };

      // Create a JSON string that can be directly used
      const jsonData = JSON.stringify(formData, null, 2);

      // Log the formatted JSON data to console
      console.log("Lead Capture Form Data (JSON format):");
      Api.patch(`/templates/${themeId}/form`, jsonData);

      // Also log parsed object for better console viewing
      console.log("Lead Capture Form Data (Object format):", formData);

      // More detailed view of fields with their required status
      console.log("Fields with required status:");
      console.table(
        fieldsData.map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          required: f.required,
        }))
      );

      // Show hidden fields in table format
      if (hiddenFields.length > 0) {
        console.log("Hidden Fields:");
        console.table(hiddenFields);
      }

      // Use alert for debugging as well


      // Show success notification
      if (typeof showNotification === "function") {
        showNotification("Lead capture form saved successfully", "success");
      }

      // Here you would typically send this data to your API
      // For example:
      // Api.patch(`/user/${themeId}/card/leadCapture`, jsonData)
      //   .then(response => console.log("API Response:", response))
      //   .catch(error => console.error("API Error:", error));
    } catch (error) {
      console.error("Error saving lead capture form data:", error);
      alert("Error saving form data. See console for details.");
    }
  };

  const leadData = data?.data.template.leadForm;

  // Link editing states
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [currentEditingLink, setCurrentEditingLink] = useState<string | null>(
    null
  );
  const [linkUsername, setLinkUsername] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [activeCategory, setActiveCategory] = useState("Social Media");

  // Define a type for user links
  type UserLink = {
    type: string;
    username: string;
    title: string;
    url?: string;
  };

  // State for storing user links data
  const [userLinks, setUserLinks] = useState<Record<string, UserLink>>({});

  //Virtual Backgrund States

  const [selectedQrColor, setSelectedQrColor] = useState<string>("black");

  const getHueRotateValue = (color: string): string => {
    switch (color) {
      case "red": return "0deg";
      case "orange": return "30deg";
      case "green": return "120deg";
      case "blue": return "240deg";
      case "purple": return "270deg";
      case "white": return "0deg"; // For white, we'll just use the invert filter
      default: return "0deg";
    }
  };
  const [condensedView, setCondensedView] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showName, setShowName] = useState<boolean>(true);
  const [showCompany, setShowCompany] = useState<boolean>(true);
  const [showJobTitle, setShowJobTitle] = useState<boolean>(true);
  const [showLocation, setShowLocation] = useState<boolean>(true);
  const [selectedVirtualBackground, setSelectedVirtualBackground] =
    useState<string>("/virtualBackground/1.jpeg");

  const [companyLogo, setCompanyLogo] = useState<string>("/company_logo.png");
  const [profileImageup, setProfileImageup] = useState<File | null>(null);
  const [coverImageup, setCoverImageup] = useState<File | null>(null);
  const [companyLogoup, setCompanyLogoup] = useState<File | null>(null);
  // Shared state for active links to synchronize between tabs
  const [activeLinks, setActiveLinks] = useState<Record<string, boolean>>({
    singleLink: false,
  });

  // State for tracking which link is being removed
  const [removingLink, setRemovingLink] = useState<string | null>(null);

  // State for notifications
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  // Function to show notification
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

  // Define the lead capture form fields with default values
  const [leadCaptureFields, setLeadCaptureFields] = useState<FieldType[]>(
    leadData?.fields || [
      { id: 1, name: "Full Name", required: false, type: "text" },
      { id: 2, name: "Email", required: true, type: "text" },
      { id: 3, name: "Phone Number", required: false, type: "text" },
      { id: 4, name: "Job Title", required: false, type: "text" },
      { id: 5, name: "Company", required: false, type: "text" },
      { id: 6, name: "Note", required: false, type: "text" },
      { id: 7, name: "File", required: false, type: "file" },
    ]
  );

  // Track the form dialog open state
  const [isLeadCaptureDialogOpen, setIsLeadCaptureDialogOpen] = useState(false);
  // Define the field type for better type safety
  type FieldType = {
    id: number;
    name: string;
    required: boolean;
    type: "text" | "dropdown" | "checkbox" | "file";
    options?: string[];
  };

  // State for the field being edited in the form
  const [editingField, setEditingField] = useState<FieldType | null>(null);

  // Function to reorder fields
  const reorderFields = (startIndex: number, endIndex: number) => {
    const result = [...leadCaptureFields];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setLeadCaptureFields(result);
  };

  // Function to reorder links with HTML5 drag-and-drop
  const reorderLinks = (startIndex: number, endIndex: number) => {
    const result = [...linkOrder];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setLinkOrder(result);
  };

  // Function to update a field
  const updateField = (id: number, updates: Partial<FieldType>) => {
    setLeadCaptureFields(
      leadCaptureFields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  // Image cropping states
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>("");
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [cropType, setCropType] = useState<"cover" | "profile" | "logo">(
    "cover"
  );

  // Handle when crop is complete
  const handleCropComplete = (croppedFile: File, croppedImageUrl: string) => {
    // Update state with cropped image based on crop type
    if (cropType === "cover") {
      setCoverImage(croppedImageUrl);
      setCoverImageup(croppedFile);
    } else if (cropType === "profile") {
      setProfileImage(croppedImageUrl);
      setProfileImageup(croppedFile);
    } else if (cropType === "logo") {
      setCompanyLogo(croppedImageUrl);
      setCompanyLogoup(croppedFile);
    }

    // Clean up temp image
    URL.revokeObjectURL(tempImageSrc);
    setTempImageSrc("");
    setTempImageFile(null);
  };

  // Cancel cropping
  const handleCloseDialog = () => {
    setIsCropperOpen(false);
    URL.revokeObjectURL(tempImageSrc);
    setTempImageSrc("");
    setTempImageFile(null);
  };

  const linkImages = {
    contact: "/links/contactcard.svg",
    discord: "/links/discord.svg",
    facetime: "/links/facetime.svg",
    calendly: "/links/calendly.svg",
    linkedin: "/links/linkedin.svg",
    instagram: "/links/instagram.svg",
    website: "/links/safari.svg",
    email: "/links/email.svg",
    call: "/links/call.svg",
    twitter: "/links/twitter.svg",
    youtube: "/links/youtube.svg",
    facebook: "/links/facebook.svg",
    whatsapp: "/links/whatsapp.svg",
    tiktok: "/links/tiktok.svg",
    snapchat: "/links/snapchat.svg",
    pinterest: "/links/pinterest.svg",
    twitch: "/links/twitch.svg",
    wechat: "/links/wechat.svg",
    text: "/links/text.svg",
    file: "/links/file.svg",
    threads: "/links/threads.svg",
    address: "/links/address.svg",
    telegram: "/links/telegram.svg",
    clubhouse: "/links/clubhouse.svg",
  };

  // Define form type
  type FormValues = {
    name: string;
    cardName: string;
    cardLayout: string;
    location: string;
    jobTitle: string;
    company: string;
    bio: string;
  }; // Initialize React Hook Form with safe defaults
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: member?.name || "",
      cardName: member?.templateName || "",
      cardLayout: member?.cardLayout || "",
      location: member?.location || "",
      jobTitle: data?.data?.template?.jobTitle || "",
      company: data?.data?.template?.company || "",
      bio: member?.bio || "",
    },
  }); // Update form values when API data is loaded - with proper null/undefined handling
  React.useEffect(() => {
    if (data?.data?.template) {
      reset({
        name: data.data.template?.name || "",
        cardName: data.data.template?.templateName || "",
        cardLayout: data.data.template?.cardLayout || "Left Aligned",
        location: data.data.template?.location || "",
        jobTitle: data.data.template?.jobTitle || "",
        company: data.data.template?.company || "",
        bio: data.data.template?.bio || "",
      });
      setProfileImage(data.data.template?.profilePicture || "/defaultpp.png");
      setCoverImage(data.data.template?.coverPhoto || "/defaultpp.png");
      setCompanyLogo(data.data.template?.companyLogo || "/defaultpp.png");
      setSelectedCardTheme(data.data.template?.cardTheme || colorOptions[0]);
      setSelectedLinkColor(data.data.template?.linkColor || colorOptions[0]);

      // Load lead form data if available
      if (data.data.template.leadForm) {
        const leadForm = data.data.template.leadForm;

        // Initialize form settings
        if (leadForm.settings) {
          setIsLeadCaptureEnabled(leadForm.settings.isEnabled || false);
          setFormHeader(leadForm.settings.formHeader || defaultFormHeader);
          setConnectButtonText(
            leadForm.settings.connectButtonText || defaultConnectButtonText
          );
          setFormDisclaimer(
            leadForm.settings.formDisclaimer || defaultFormDisclaimer
          );
        }

        // Initialize form fields from API
        if (leadForm.fields?.length) {
          setLeadCaptureFields(leadForm.fields);
        }

        // Initialize hidden fields from API
        if (leadForm.hiddenFields?.length) {
          setHiddenFields(leadForm.hiddenFields);
        }
      }

      // Load links data from API
      if (linkData) {
        try {
          console.log("Loaded links data from API:", linkData);

          // Load link order from API
          if (linkData.linkOrder) {
            setLinkOrder(linkData.linkOrder);
            console.log("Link order set:", linkData.linkOrder);
          }

          // Load active links from API
          if (linkData.activeLinks) {
            setActiveLinks({ ...activeLinks, ...linkData.activeLinks });
            console.log("Active links set:", linkData.activeLinks);
          }

          // Load user links data
          if (linkData.userLinks) {
            setUserLinks(linkData.userLinks);
            console.log("User links set:", linkData.userLinks);
          }
        } catch (e) {
          console.error("Error loading links data:", e);
        }
      }

      // Legacy support for older data format
      else if (
        data.data.template?.activeLinks ||
        data.data.template?.linkOrder
      ) {
        try {
          if (data.data.template?.activeLinks) {
            const savedLinks = JSON.parse(data.data.template.activeLinks);
            setActiveLinks({ ...activeLinks, ...savedLinks });
          }

          if (data.data.template?.linkOrder) {
            const savedLinkOrder = JSON.parse(data.data.template.linkOrder);
            setLinkOrder(savedLinkOrder);
          }
        } catch (e) {
          console.error("Error parsing legacy links data:", e);
        }
      }
    }
  }, [data, reset]);

  // Function to handle save button in Links section
  const onSaveLinks = () => {
    // Create a comprehensive links data object in the format expected by the API
    const linksData = {
      links: {
        linkOrder, // Array of link ids that determines the order
        activeLinks, // Object with key-value pairs of linkId: boolean
        userLinks, // Object with link data including title and url/username
      },
    };

    console.log("Saving links data:", linksData);

    // Send the data to the API
    Api.patch(`/templates/${themeId}/links`, JSON.stringify(linksData))
      .then((response) => {
        console.log("API Response:", response);
        showNotification("Links updated successfully", "success");
      })
      .catch((error) => {
        console.error("Error updating links:", error);
        showNotification("Failed to update links", "error");
      });
  };

  // Get all form values for live preview
  const formData = watch(); // Form submission handler
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("templateName", data.cardName);
      formData.append("location", data.location);
      formData.append("jobTitle", data.jobTitle);
      formData.append("company", data.company);
      formData.append("bio", data.bio);
      formData.append("cardTheme", selectedCardTheme);
      formData.append("linkColor", selectedLinkColor);
      formData.append("cardLayout", data.cardLayout);
      formData.append("font", selectedFont);
      formData.append("matchLinkToTheme", String(matchLinkToTheme)); // boolean'ı string yapıyoruz
      // Add active links data and their order
      formData.append("activeLinks", JSON.stringify(activeLinks));
      formData.append("linkOrder", JSON.stringify(linkOrder));

      // Eğer görsel veriler varsa ekle
      if (profileImageup) {
        formData.append("profilePicture", profileImageup);
      }
      if (coverImageup) {
        formData.append("coverPhoto", coverImageup);
      }
      if (companyLogoup) {
        formData.append("companyLogo", companyLogoup);
      }

      console.log("Updating card data:", formData);

      const response = await Api.patch(
        `/templates/${themeId}/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response && response.status === 200) {
        showNotification("Changes saved successfully!", "success");
      } else {
        showNotification("Failed to save changes. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error saving card data:", error);
      alert("An error occurred while saving your changes. Please try again.");
    }
  };
  const cardLayoutLiv = getValues('cardLayout');
  const navItems = [
    {
      name: "About",
      value: "about",
      icon: User2,
      description: "Personal information about the member",
    },
    {
      name: "Links",
      value: "links",
      icon: LinkIcon,
      description: "Social media and website links",
    },
    {
      name: "Lead Capture Form",
      value: "lead-capture-form",
      icon: FileText,
      description: "Form settings for capturing leads",
    },
  ];
  const renderContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">About</h2>

            {/* Card Name ve Card Layout Bölümü */}
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Card Name */}
              <div className="w-full md:w-1/2">
                <div className="flex items-center gap-2">
                  <label className="text-[11.5px] font-medium whitespace-nowrap">
                    Card Name:
                  </label>{" "}
                  <Controller
                    name="cardName"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        className="px-2 py-1.5 rounded-md bg-[#F7F7F7] text-xs font-medium focus:outline-none"
                        placeholder="Enter card name"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Card Layout with Dropdown */}
              <div className="w-full md:w-1/2">
                <div className="flex items-center gap-2">
                  <label className="text-[11.5px] font-medium whitespace-nowrap">
                    Card Layout:
                  </label>{" "}
                  <Controller
                    name="cardLayout" // form'daki alan ismi
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex px-3 w-full justify-between py-2 rounded-md bg-[#F7F7F7] text-xs font-medium focus:outline-none"
                          >
                            <span className="text-xs font-medium">
                              {field.value || "Select layout"}
                            </span>
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-1">
                          <div className="space-y-0.5">
                            {["Left Aligned", "Center Aligned", "Portrait"].map(
                              (layout) => (
                                <button
                                  key={layout}
                                  type="button"
                                  className={`w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors ${field.value === layout ? "bg-slate-100" : ""
                                    }`}
                                  onClick={() => field.onChange(layout)}
                                >
                                  {layout}
                                </button>
                              )
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Resim Bölümleri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {" "}
              {/* Profile Picture */}{" "}
              <div className="space-y-3">
                <label className="text-sm font-medium block">
                  Profile Picture
                </label>
                <div className="flex flex-col items-center gap-3">
                  {" "}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          // Create a URL for the selected file to display the preview
                          const fileUrl = URL.createObjectURL(
                            e.target.files[0]
                          );
                          setTempImageSrc(fileUrl);
                          setTempImageFile(e.target.files[0]);
                          setCropType("profile");
                          setIsCropperOpen(true);
                          console.log(
                            "Profile picture selected for cropping:",
                            e.target.files[0]
                          );
                        }
                      }}
                    />
                    <div className="w-[90px] h-[90px] rounded-full bg-slate-100 border relative flex items-center justify-center overflow-hidden">
                      <Image
                        src={profileImage}
                        alt="Profile"
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, 90px"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </label>{" "}
                  <label className="text-xs text-blue-600 font-medium cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          // Create a URL for the selected file to display the preview
                          const fileUrl = URL.createObjectURL(
                            e.target.files[0]
                          );
                          setTempImageSrc(fileUrl);
                          setTempImageFile(e.target.files[0]);
                          setCropType("profile");
                          setIsCropperOpen(true);
                          console.log(
                            "Profile picture selected for cropping:",
                            e.target.files[0]
                          );
                        }
                      }}
                    />
                    Change Picture
                  </label>
                </div>
              </div>{" "}
              {/* Cover Photo */}
              <div className="space-y-3">
                {" "}
                <label className="text-sm font-medium block">Cover Photo</label>
                <div className="flex flex-col items-center gap-3">
                  {" "}
                  <label className="w-full cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          // Create a URL for the selected file to display the preview
                          const fileUrl = URL.createObjectURL(
                            e.target.files[0]
                          );
                          setTempImageSrc(fileUrl);
                          setTempImageFile(e.target.files[0]);
                          setCropType("cover");
                          setIsCropperOpen(true);
                          console.log(
                            "Cover photo selected for cropping:",
                            e.target.files[0]
                          );
                        }
                      }}
                    />
                    <div className="w-full h-[90px] rounded-lg bg-slate-100 border relative flex items-center justify-center overflow-hidden">
                      {coverImage ? (
                        <Image
                          src={coverImage}
                          alt="Cover Photo"
                          className="object-cover"
                          fill
                          sizes="100%"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600 flex items-center justify-center" />
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </label>{" "}
                  <label className="text-xs text-blue-600 font-medium cursor-pointer">
                    {" "}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          // Create a URL for the selected file to display the preview
                          const fileUrl = URL.createObjectURL(
                            e.target.files[0]
                          );
                          setTempImageSrc(fileUrl);
                          setTempImageFile(e.target.files[0]);
                          setCropType("cover");
                          setIsCropperOpen(true);
                          console.log(
                            "Cover photo selected for cropping:",
                            e.target.files[0]
                          );
                        }
                      }}
                    />
                    Change Cover
                  </label>
                </div>
              </div>
              {/* Company Logo */}{" "}
              <div className="space-y-3">
                <label className="text-sm font-medium block">
                  Company Logo
                </label>
                <div className="flex flex-col items-center gap-3">
                  {" "}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          // Create a URL for the selected file to display the preview
                          const fileUrl = URL.createObjectURL(
                            e.target.files[0]
                          );
                          setTempImageSrc(fileUrl);
                          setTempImageFile(e.target.files[0]);
                          setCropType("logo");
                          setIsCropperOpen(true);
                          console.log(
                            "Company logo selected for cropping:",
                            e.target.files[0]
                          );
                        }
                      }}
                    />
                    <div className="w-[90px] h-[90px] rounded-full bg-white border border-slate-200 relative flex items-center justify-center overflow-hidden p-2">
                      <Image
                        src={companyLogo || ""}
                        alt="Company"
                        fill
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </label>{" "}
                  <label className="text-xs text-blue-600 font-medium cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          // Create a URL for the selected file to display the preview
                          const fileUrl = URL.createObjectURL(
                            e.target.files[0]
                          );
                          setTempImageSrc(fileUrl);
                          setTempImageFile(e.target.files[0]);
                          setCropType("logo");
                          setIsCropperOpen(true);
                          console.log(
                            "Company logo selected for cropping:",
                            e.target.files[0]
                          );
                        }
                      }}
                    />
                    Change Logo
                  </label>
                </div>
              </div>
            </div>

            {/* Member Information Form */}
            <div className="space-y-6 p-4  rounded-lg">
              {/* Name and Location Row */}
              {/* Job Title and Company Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-normal block">Location</label>{" "}
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        className="w-full px-3 py-3 rounded-[10px] bg-[#F7F7F7] text-sm font-normal focus:outline-none"
                        placeholder="Enter location"
                        {...field}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-normal block">Company</label>{" "}
                  <Controller
                    name="company"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        className="w-full px-3 py-3 rounded-[10px] bg-[#F7F7F7] text-sm font-normal focus:outline-none"
                        placeholder="Enter company name"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <label className="text-sm font-normal block">Bio</label>{" "}
                <Controller
                  name="bio"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      className="w-full px-3 py-3 resize-none rounded-[10px] bg-[#F7F7F7] text-sm font-normal focus:outline-none min-h-[100px]"
                      placeholder="Enter bio"
                      {...field}
                    />
                  )}
                />
              </div>

              {/* Theme Selection - Redesigned */}
              <label className="text-sm font-normal block">Choose Theme</label>
              <div className="space-y-4 p-4 bg-[#F7F7F7] rounded-[10px]">
                {" "}
                {/* Card Theme */}{" "}
                <div className="space-y-2">
                  <div className="flex bg-white p-3 rounded-xl border items-center justify-between">
                    <label className="text-sm font-normal">Card Theme</label>
                    <div className="flex items-center gap-2">
                      {/* Transparent Option */}
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="cardTheme"
                          value="transparent"
                          checked={selectedCardTheme === "transparent"}
                          onChange={() => {
                            const scrollPosition = window.scrollY;
                            setSelectedCardTheme("transparent");
                            setTimeout(() => window.scrollTo(0, scrollPosition), 0);
                          }}
                          className="sr-only"
                        />
                        <div className="h-6 w-6 rounded-full border-2 border-slate-300 flex items-center justify-center relative overflow-hidden bg-white">
                          {selectedCardTheme === "transparent" && (
                            <motion.div
                              className="absolute inset-0 border-2 border-black rounded-full"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 1.2, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                          )}
                        </div>
                      </label>

                      {/* Preset Colors */}
                      {colorOptions.map((color, index) => (
                        <label key={index} className="cursor-pointer">
                          <input
                            type="radio"
                            name="cardTheme"
                            value={color}
                            checked={selectedCardTheme === color}
                            onChange={() => {
                              const scrollPosition = window.scrollY;
                              setSelectedCardTheme(color);
                              setTimeout(() => window.scrollTo(0, scrollPosition), 0);
                            }}
                            className="sr-only"
                          />
                          <motion.div
                            className="h-6 w-6 rounded-full relative overflow-hidden"
                            style={{ backgroundColor: color }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            {selectedCardTheme === color && (
                              <motion.div
                                className="absolute inset-0 border-2 border-black rounded-full"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.2, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                              />
                            )}
                          </motion.div>
                        </label>
                      ))}

                      {/* Custom Color Picker */}
                      <label className="relative h-6 w-6 rounded-full bg-slate-100 border border-slate-300 cursor-pointer">
                        <input
                          type="color"
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          onChange={(e) => {
                            const customColor = e.target.value;
                            const scrollPosition = window.scrollY;
                            setSelectedCardTheme(customColor);
                            setTimeout(() => window.scrollTo(0, scrollPosition), 0);
                          }}
                          aria-label="Custom color"
                        />
                        <div
                          className="h-full w-full flex justify-center items-center rounded-full relative"
                          style={{ border: `5px solid ${selectedCardTheme}` }}>
                          <Plus className="h-2.5 w-2.5"></Plus>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Spacer */}
                <div className=""></div>
                {/* Link Color */}
                <div className=" bg-white p-3 rounded-xl border">
                  {" "}
                  <div className="space-y-2 ">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-normal">Link Color</label>
                      <div className="flex items-center gap-2">
                        {" "}
                        {/* Transparent (first color) */}{" "}
                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            name="linkColor"
                            value="transparent"
                            checked={selectedLinkColor === "transparent"}
                            onChange={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const scrollPosition = window.scrollY;
                              setSelectedLinkColor("transparent");
                              setTimeout(
                                () => window.scrollTo(0, scrollPosition),
                                0
                              );
                            }}
                            className="sr-only"
                          />
                          <motion.div
                            className="h-6 w-6 rounded-full border-2 border-slate-300 flex items-center justify-center relative overflow-hidden"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 17,
                            }}
                          >
                            <div className="h-4 w-4 rounded-full bg-white"></div>
                            {selectedLinkColor === "transparent" && (
                              <motion.div
                                className="absolute inset-0 border-2 border-black rounded-full"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.2, opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 25,
                                }}
                              />
                            )}
                          </motion.div>
                        </label>
                        {/* 6 preset colors */}{" "}
                        {colorOptions.map((color, index) => (
                          <label key={index} className="cursor-pointer">
                            <input
                              type="radio"
                              name="linkColor"
                              value={color}
                              checked={selectedLinkColor === color}
                              onChange={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const scrollPosition = window.scrollY;
                                setSelectedLinkColor(color);
                                setTimeout(
                                  () => window.scrollTo(0, scrollPosition),
                                  0
                                );
                              }}
                              className="sr-only"
                            />
                            <motion.div
                              className="h-6 w-6 rounded-full relative overflow-hidden"
                              style={{ backgroundColor: color }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 17,
                              }}
                            >
                              {selectedLinkColor === color && (
                                <motion.div
                                  className="absolute inset-0 border-2 border-black rounded-full"
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 1.2, opacity: 0 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                  }}
                                />
                              )}
                            </motion.div>
                          </label>
                        ))}
                        {/* Custom Color Picker */}
                        <label className="relative h-6 w-6 rounded-full bg-slate-100 border border-slate-300 cursor-pointer">
                          <input
                            type="color"
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            onChange={(e) => {
                              const customColor = e.target.value;
                              const scrollPosition = window.scrollY;
                              setSelectedLinkColor(customColor);
                              setTimeout(() => window.scrollTo(0, scrollPosition), 0);
                            }}
                            aria-label="Custom link color"
                          />
                          <div
                            className="h-full w-full flex justify-center items-center rounded-full relative"
                            style={{ border: `5px solid ${selectedLinkColor}` }}>
                            <Plus className="h-2.5 w-2.5"></Plus>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* Separator */}
                  <div className="border-t my-3 border-slate-200"></div>
                  {/* Match Link Icons to Card Theme */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-normal">
                      Match Link Icons to Card Theme
                    </label>
                    <div
                      className="relative inline-flex items-center cursor-pointer"
                      onClick={() => setMatchLinkToTheme(!matchLinkToTheme)}
                    >
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        id="match-theme"
                        checked={matchLinkToTheme}
                        onChange={() => { }} // Needed to avoid React warning about controlled components
                      />
                      <div className="h-5 w-9 rounded-full bg-gray-300 peer-checked:bg-black after:content-[''] after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4"></div>
                      <label htmlFor="match-theme" className="sr-only">
                        Match link icons to theme
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Font Selection */}
              <label className="text-sm font-normal block">Choose Font</label>
              <div className=" bg-[#F7F7F7] rounded-xl p-5 space-y-2">
                {" "}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="w-full flex items-center justify-between px-3 py-3 rounded-[10px] bg-white text-sm font-normal focus:outline-none"
                      style={{ fontFamily: selectedFont }}
                    >
                      <span className="text-sm">{selectedFont}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-1">
                    <div className="space-y-0.5">
                      <button
                        className={`w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors font-['Inter'] ${selectedFont === "Inter" ? "bg-slate-100" : ""}`}
                        onClick={() => setSelectedFont("Inter")}
                      >
                        Inter
                      </button>
                      <button
                        className={`w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors font-['Roboto'] ${selectedFont === "Roboto" ? "bg-slate-100" : ""}`}
                        onClick={() => setSelectedFont("Roboto")}
                      >
                        Roboto
                      </button>
                      <button
                        className={`w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors font-['Poppins'] ${selectedFont === "Poppins" ? "bg-slate-100" : ""}`}
                        onClick={() => setSelectedFont("Poppins")}
                      >
                        Poppins
                      </button>
                      <button
                        className={`w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors font-['Montserrat'] ${selectedFont === "Montserrat" ? "bg-slate-100" : ""}`}
                        onClick={() => setSelectedFont("Montserrat")}
                      >
                        Montserrat
                      </button>
                      <button
                        className={`w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors font-['Open Sans'] ${selectedFont === "Open Sans" ? "bg-slate-100" : ""}`}
                        onClick={() => setSelectedFont("Open Sans")}
                      >
                        Open Sans
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-[10px] text-[#828282] ml-3 font-medium">
                  Custom fonts will be applied when sharing your card. They are
                  not yet available in the mobile app.
                </p>
              </div>
              {/* Save Button */}
              <div className="pt-2">
                <Button
                  className="w-full rounded-[10px] py-3 font-normal"
                  onClick={handleSubmit(onSubmit)}
                >
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Field Edit Dialog */}
            <Dialog
              open={!!editingField}
              onOpenChange={(open) => !open && setEditingField(null)}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Field</DialogTitle>
                </DialogHeader>

                {editingField && (
                  <div className="space-y-4 py-2">
                    {/* Field Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Field Name</label>
                      <input
                        type="text"
                        value={editingField.name}
                        onChange={(e) =>
                          setEditingField({
                            ...editingField,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>

                    {/* Field Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Field Type</label>
                      <select
                        value={editingField.type}
                        onChange={(e) =>
                          setEditingField({
                            ...editingField,
                            type: e.target.value as
                              | "text"
                              | "dropdown"
                              | "checkbox"
                              | "file",
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="text">Text</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="file">File Upload</option>
                      </select>
                    </div>

                    {/* Required Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Required Field
                      </span>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingField.required}
                          onChange={() =>
                            setEditingField({
                              ...editingField,
                              required: !editingField.required,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-black after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                      </div>
                    </div>

                    {/* Dropdown Options (only show if type is dropdown) */}
                    {editingField.type === "dropdown" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Dropdown Options
                        </label>
                        <div className="space-y-2">
                          {(editingField.options || []).map((option, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [
                                    ...(editingField.options || []),
                                  ];
                                  newOptions[idx] = e.target.value;
                                  setEditingField({
                                    ...editingField,
                                    options: newOptions,
                                  });
                                }}
                                className="flex-1 px-3 py-1 border rounded-md text-sm"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = [
                                    ...(editingField.options || []),
                                  ];
                                  newOptions.splice(idx, 1);
                                  setEditingField({
                                    ...editingField,
                                    options: newOptions,
                                  });
                                }}
                                className="p-1 hover:bg-gray-200 rounded-full"
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          ))}

                          <Button
                            onClick={() => {
                              const newOptions = [
                                ...(editingField.options || []),
                                "New Option",
                              ];
                              setEditingField({
                                ...editingField,
                                options: newOptions,
                              });
                            }}
                            variant="outline"
                            size="sm"
                            className="mt-1"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Option
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditingField(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (editingField) {
                        updateField(editingField.id, editingField);
                        setEditingField(null);
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Lead Capture Form Preview Dialog */}
            <Dialog
              open={isLeadCaptureDialogOpen}
              onOpenChange={setIsLeadCaptureDialogOpen}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Lead Capture Form Preview</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center py-4">
                  <LeadCaptureViewCard
                    profileImage={profileImage}
                    formHeader={formHeader}
                    fields={leadCaptureFields}
                    selectedCardTheme={selectedCardTheme}
                    selectedFont={selectedFont}
                    selectedLinkColor={selectedLinkColor}
                    connectButtonText={connectButtonText}
                    formDisclaimer={formDisclaimer}
                    hiddenFields={hiddenFields}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsLeadCaptureDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      case "follow-up-email":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Follow Up Email</h2>

            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                When Follow Up Email is enabled, an email intro will
                automatically be sent after connecting with a new lead. You can
                edit the email intro and the time it is sent below.
              </p>

              <div className="flex items-center justify-between">
                <div></div>
                <Switch className="data-[state=checked]:bg-black" />
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium">
                  Schedule Follow Up Email Delay
                </h3>
                <Info size={16} className="text-gray-400" />
              </div>

              <div className="flex gap-4">
                <div className="w-full relative">
                  <input
                    type="number"
                    min="0"
                    defaultValue="0"
                    className="w-full px-3 py-3 pr-16 rounded-[10px] bg-[#F7F7F7] focus:outline-none"
                  />
                  <span className="absolute top-1/2 right-4 transform -translate-y-1/2 text-sm text-gray-500">
                    Hours
                  </span>
                </div>
                <div className="w-full relative">
                  <input
                    type="number"
                    min="0"
                    defaultValue="0"
                    className="w-full px-3 py-3 pr-16 rounded-[10px] bg-[#F7F7F7] focus:outline-none"
                  />
                  <span className="absolute top-1/2 right-4 transform -translate-y-1/2 text-sm text-gray-500">
                    Minutes
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-medium">To:</h3>
              <div className="flex items-center">
                <div className="bg-[#F7F7F7] px-3 py-3 rounded-l-[10px] text-sm">
                  New Lead&apos;s Email
                </div>
                <input
                  type="text"
                  value="faruk@babel.com.tr"
                  className="flex-1 px-3 py-3 bg-[#F7F7F7] rounded-r-[10px] focus:outline-none"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium">Cc Recipients</h3>
                <button className="text-blue-500 text-sm">add bcc</button>
              </div>
              <input
                type="email"
                placeholder="name@email.com"
                className="w-full px-3 py-3 rounded-[10px] bg-[#F7F7F7] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-medium">
                Subject <span className="text-red-500">*</span>
              </h3>
              <div className="flex items-center bg-[#F7F7F7] rounded-[10px] px-3 py-3">
                <span className="text-amber-500 mr-2">👋</span>
                <span>Copy of Faruk &lt;&gt; </span>
                <span className="text-blue-500">Lead&apos;s First Name</span>
                <span className="ml-2">| Popl</span>
              </div>

              <div className="flex justify-end">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-blue-500 mt-2 border border-blue-400 rounded-full"
                    >
                      Add Variable <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="space-y-1 p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                      >
                        Lead&apos;s First Name
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                      >
                        Lead&apos;s Full Name
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                      >
                        My digital business card URL
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                      >
                        Popl User&apos;s Name
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-medium">
                Message <span className="text-red-500">*</span>
              </h3>
              <textarea
                placeholder="Write your message here..."
                className="w-full px-3 py-3 min-h-[150px] rounded-[10px] bg-[#F7F7F7] focus:outline-none resize-none"
                defaultValue={`daf Lead\'s First Name Lead\'s Full Name`}
              />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  className="text-blue-500 mt-2 border border-blue-400 rounded-full"
                >
                  Add Variable <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
                <button className="text-sm text-gray-500">
                  Reset to default
                </button>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" className="rounded-full">
                Send Test Email
              </Button>
              <Button variant="outline" className="rounded-full">
                Cancel
              </Button>
              <Button className="rounded-full bg-black text-white hover:bg-black/90">
                Update
              </Button>
            </div>
          </div>
        );
      case "qr-code":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">QR Code</h2>
            <p>Generate and customize QR codes here.</p>
          </div>
        );
      case "virtual-background":
        return (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.h2
              className="text-xl font-semibold mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Virtual Background
            </motion.h2>
            <motion.p
              className="text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              Customize your virtual meeting background with your digital
              business card
            </motion.p>

            <div className="space-y-5">
              {/* Choose QR color section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-sm font-medium mb-2">Choose QR color</h3>
                <div className="flex items-center gap-3 ml-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedQrColor("white")}
                    className={`h-6 w-6 rounded-full border shadow-sm hover:shadow-md transition-shadow ${selectedQrColor === "white" ? "ring-1 ring-offset-1 ring-black" : ""} flex items-center justify-center`}
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedQrColor("black")}
                    className={`h-6 w-6 rounded-full bg-black border shadow-sm hover:shadow-md transition-shadow ${selectedQrColor === "black" ? "ring-2 ring-offset-2 ring-black" : ""}`}
                  ></motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedQrColor("red")}
                    className={`h-6 w-6 rounded-full bg-red-500 border shadow-sm hover:shadow-md transition-shadow ${selectedQrColor === "red" ? "ring-2 ring-offset-2 ring-black" : ""}`}
                  ></motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedQrColor("orange")}
                    className={`h-6 w-6 rounded-full bg-orange-500 border shadow-sm hover:shadow-md transition-shadow ${selectedQrColor === "orange" ? "ring-2 ring-offset-2 ring-black" : ""}`}
                  ></motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedQrColor("green")}
                    className={`h-6 w-6 rounded-full bg-green-500 border shadow-sm hover:shadow-md transition-shadow ${selectedQrColor === "green" ? "ring-2 ring-offset-2 ring-black" : ""}`}
                  ></motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedQrColor("blue")}
                    className={`h-6 w-6 rounded-full bg-blue-500 border shadow-sm hover:shadow-md transition-shadow ${selectedQrColor === "blue" ? "ring-2 ring-offset-2 ring-black" : ""}`}
                  ></motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedQrColor("purple")}
                    className={`h-6 w-6 rounded-full bg-purple-500 border shadow-sm hover:shadow-md transition-shadow ${selectedQrColor === "purple" ? "ring-2 ring-offset-2 ring-black" : ""}`}
                  ></motion.button>
                </div>
              </motion.div>

              {/* Condensed view option */}
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <input
                  type="checkbox"
                  id="condensed-view"
                  checked={condensedView}
                  onChange={() => setCondensedView(!condensedView)}
                  className="h-5 w-5 rounded border-gray-300 text-black focus:ring-0 accent-black"
                />
                <div className="flex flex-col">
                  <label
                    htmlFor="condensed-view"
                    className="text-sm font-medium"
                  >
                    Condensed view
                  </label>
                  <span className="text-xs text-gray-500">
                    Optimal for Microsoft Teams
                  </span>
                </div>
              </motion.div>

              {/* QR Code option */}
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <input
                  type="checkbox"
                  id="qr-code"
                  checked={showQrCode}
                  onChange={() => setShowQrCode(!showQrCode)}
                  className="h-5 w-5 rounded border-gray-300 text-black focus:ring-0 accent-black"
                />
                <div className="flex flex-col">
                  <label htmlFor="qr-code" className="text-sm font-medium">
                    QR Code
                  </label>
                  <span className="text-xs text-gray-500">
                    QR Code can be customized in the QR Code section
                  </span>
                </div>
              </motion.div>

              {/* Name and Company options */}
              <motion.div
                className="grid grid-cols-2 gap-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="show-name"
                    checked={showName}
                    onChange={() => setShowName(!showName)}
                    className="h-5 w-5 rounded border-gray-300 text-black focus:ring-0 accent-black"
                  />
                  <label htmlFor="show-name" className="text-sm font-medium">
                    Name
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="show-company"
                    checked={showCompany}
                    onChange={() => setShowCompany(!showCompany)}
                    className="h-5 w-5 rounded border-gray-300 text-black focus:ring-0 accent-black"
                  />
                  <label htmlFor="show-company" className="text-sm font-medium">
                    Company
                  </label>
                </div>
              </motion.div>

              {/* Job Title and Location options */}
              <motion.div
                className="grid grid-cols-2 gap-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="show-job-title"
                    checked={showJobTitle}
                    onChange={() => setShowJobTitle(!showJobTitle)}
                    className="h-5 w-5 rounded border-gray-300 text-black focus:ring-0 accent-black"
                  />
                  <label
                    htmlFor="show-job-title"
                    className="text-sm font-medium"
                  >
                    Job Title
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="show-location"
                    checked={showLocation}
                    onChange={() => setShowLocation(!showLocation)}
                    className="h-5 w-5 rounded border-gray-300 text-black focus:ring-0 accent-black"
                  />
                  <label
                    htmlFor="show-location"
                    className="text-sm font-medium"
                  >
                    Location
                  </label>
                </div>
              </motion.div>

              {/* Background selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="pt-2"
              >
                <div className="flex justify-between items-center mb-3 bg-gray-50/70 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700">
                    Choose from library
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm font-medium bg-white px-3 py-1.5 rounded-full border hover:shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload image
                  </motion.button>
                </div>
                <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
                  {/* 3x4 grid of virtual background images */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <motion.div
                      key={num}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative aspect-video rounded-md overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow ${selectedVirtualBackground === `/virtualBackground/${num}.jpeg` ? "ring-2 ring-black" : ""}`}
                      onClick={() =>
                        setSelectedVirtualBackground(
                          `/virtualBackground/${num}.jpeg`
                        )
                      }
                    >
                      <Image
                        src={`/virtualBackground/${num}.jpeg`}
                        alt={`Virtual background ${num}`}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Navigation buttons */}
              <motion.div
                className="flex justify-between items-center pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              ></motion.div>
            </div>
          </motion.div>
        );

      case "email-signature":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Email Signature</h2>
            <p>Create and manage email signatures here.</p>
          </div>
        );
      case "links":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Links</h2>

            {/* Toggle options and Add button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-full">
                <div
                  className={`flex items-center space-x-1 px-4 py-2 rounded-full ${activeLinks.singleLink ? "bg-white shadow-sm" : ""}`}
                >
                  <span className="text-sm">Box Type</span>
                  <Switch
                    checked={activeLinks.singleLink}
                    onCheckedChange={(checked) =>
                      setActiveLinks({ ...activeLinks, singleLink: checked })
                    }
                    className="scale-75"
                  />
                </div>
              </div>

              <Button
                className="bg-black text-white hover:bg-black/90 rounded-full gap-2"
                onClick={() => setIsLinksModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Links and Contact Info
              </Button>
            </div>
            {/* Links List */}
            <div className="space-y-3 mt-6">
              <div className="space-y-3">
                {linkOrder.map((linkKey: string, index) => {
                  const isActive =
                    activeLinks[linkKey as keyof typeof activeLinks];
                  const linkName =
                    linkKey.charAt(0).toUpperCase() + linkKey.slice(1);
                  let iconComponent;
                  let bgClass = "";

                  if (linkKey === "email") {
                    iconComponent = (
                      <div className="relative w-6 h-6">
                        <Image
                          src={linkImages.email || "/links/email.svg"}
                          alt="Email"
                          fill
                          sizes="24px"
                        />
                      </div>
                    );
                    bgClass = "bg-blue-500";
                  } else if (linkKey === "instagram") {
                    iconComponent = (
                      <div className="relative w-6 h-6">
                        <Image
                          src={linkImages.instagram}
                          alt="Instagram"
                          fill
                          sizes="24px"
                        />
                      </div>
                    );
                    bgClass =
                      "bg-gradient-to-br from-pink-500 via-purple-600 to-yellow-400";
                  } else if (linkKey === "linkedin") {
                    iconComponent = (
                      <div className="relative w-6 h-6">
                        <Image
                          src={linkImages.linkedin}
                          alt="LinkedIn"
                          fill
                          sizes="24px"
                        />
                      </div>
                    );
                    bgClass = "bg-blue-600";
                  } else if (linkKey === "website") {
                    iconComponent = (
                      <div className="relative w-6 h-6">
                        <Image
                          src={linkImages.website}
                          alt="Website"
                          fill
                          sizes="24px"
                        />
                      </div>
                    );
                    bgClass = "bg-blue-400";
                  } else if (linkKey === "contact") {
                    iconComponent = (
                      <div className="relative w-6 h-6">
                        <Image
                          src={linkImages.contact}
                          alt="Contact"
                          fill
                          sizes="24px"
                        />
                      </div>
                    );
                    bgClass = "bg-green-500";
                  } else if (linkKey === "discord") {
                    iconComponent = (
                      <div className="relative w-6 h-6">
                        <Image
                          src={linkImages.discord}
                          alt="Discord"
                          fill
                          sizes="24px"
                        />
                      </div>
                    );
                    bgClass = "bg-indigo-500";
                  } else if (linkKey === "facetime") {
                    iconComponent = (
                      <div className="relative w-6 h-6">
                        <Image
                          src={linkImages.facetime}
                          alt="FaceTime"
                          fill
                          sizes="24px"
                        />
                      </div>
                    );
                    bgClass = "bg-green-400";
                  } else if (linkKey === "calendly") {
                    iconComponent = (
                      <div className="relative w-6 h-6">
                        <Image
                          src={linkImages.calendly}
                          alt="Calendly"
                          fill
                          sizes="24px"
                        />
                      </div>
                    );
                    bgClass = "bg-blue-500";
                  } else if (linkKey === "resume" || linkKey === "file") {
                    iconComponent = (
                      <div className="relative w-6 h-6">
                        <Image
                          src={linkImages.file}
                          alt="File"
                          fill
                          sizes="24px"
                        />
                      </div>
                    );
                    bgClass = "bg-gray-600";
                  } else {
                    // Default icon for any other link types that might be added
                    const linkImageKey = linkKey as keyof typeof linkImages;
                    if (linkImages[linkImageKey]) {
                      iconComponent = (
                        <div className="relative w-6 h-6">
                          <Image
                            src={linkImages[linkImageKey]}
                            alt={linkName}
                            fill
                            sizes="24px"
                          />
                        </div>
                      );
                    } else {
                      iconComponent = (
                        <LinkIcon className="h-4 w-4 text-white" />
                      );
                    }
                    bgClass = "bg-blue-500";
                  }

                  // Link silme fonksiyonu
                  const handleDeleteLink = () => {
                    console.log("Deleting link:", linkKey);

                    // Removing process visualization
                    setRemovingLink(linkKey);

                    // Delayed removal with animation effect
                    setTimeout(() => {
                      // userLinks'den linki kaldır
                      const newUserLinks = { ...userLinks };
                      delete newUserLinks[linkKey];
                      setUserLinks(newUserLinks);

                      // Linki deaktif et ve tamamen kaldır
                      setActiveLinks((prev) => {
                        const newActiveLinks = { ...prev };
                        delete newActiveLinks[linkKey]; // Completely remove the key instead of setting to false
                        return newActiveLinks;
                      });

                      // Linki linkOrder listesinden de kaldır
                      const newLinkOrder = linkOrder.filter(
                        (link) => link !== linkKey
                      );
                      setLinkOrder(newLinkOrder);

                      // Bildirim göster
                      showNotification(
                        `${linkName} successfully removed`,
                        "success"
                      );

                      // Reset removing state
                      setRemovingLink(null);
                    }, 300); // Animation duration
                  };

                  return (
                    <div
                      key={linkKey}
                      className={`flex items-center justify-between bg-gray-50 p-4 rounded-xl hover:shadow-md hover:border-gray-300 border border-transparent transition-all ${removingLink === linkKey ? "opacity-50" : ""}`}
                      draggable
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        e.dataTransfer.setData("text/plain", index.toString());
                      }}
                      onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                        e.preventDefault();
                      }}
                      onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                        e.preventDefault();
                        const draggedIndex = parseInt(
                          e.dataTransfer.getData("text/plain")
                        );
                        if (draggedIndex !== index) {
                          reorderLinks(draggedIndex, index);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-4 w-full cursor-grab active:cursor-grabbing">
                        <div className="flex-shrink-0 text-gray-400 p-2  rounded">
                          <div className="grid grid-cols-3 gap-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                        <div
                          className={`w-10 h-10 rounded-md ${bgClass} flex items-center justify-center overflow-hidden`}
                        >
                          {iconComponent}
                        </div>
                        <span className="text-base font-medium">
                          {userLinks[linkKey]?.title || linkName}
                        </span>
                        {userLinks[linkKey] && (
                          <span className="text-xs text-gray-500 italic ml-2">
                            {userLinks[linkKey].url ||
                              userLinks[linkKey].username}
                          </span>
                        )}
                      </div>
                      <div
                        className="flex items-center space-x-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200 transform hover:scale-110"
                          onClick={handleDeleteLink}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) =>
                            setActiveLinks({
                              ...activeLinks,
                              [linkKey]: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Changes Button */}
            <div className="flex justify-end mt-6">
              <Button
                className="bg-black text-white hover:bg-black/90 rounded-full px-6"
                onClick={onSaveLinks}
              >
                Save Changes
              </Button>
            </div>

            {/* Recommended links section */}
            {showRecommendedLinks && (
              <div className="mt-8 border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium">Recommended links</h3>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowRecommendedLinks(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {/* Call Link */}
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between group hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-md bg-green-500 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">Call</span>
                    </div>
                    <button
                      className="text-gray-400 group-hover:text-green-500 transition-colors hover:scale-110 transform"
                      onClick={() => handleAddRecommendedLink("call")}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* LinkedIn Link */}
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between group hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
                        <div className="text-white font-bold text-sm">in</div>
                      </div>
                      <span className="text-sm font-medium">LinkedIn</span>
                    </div>
                    <button
                      className="text-gray-400 group-hover:text-blue-600 transition-colors hover:scale-110 transform"
                      onClick={() => handleAddRecommendedLink("linkedin")}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Website Link */}
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between group hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-md bg-blue-400 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">Website</span>
                    </div>
                    <button
                      className="text-gray-400 group-hover:text-blue-400 transition-colors hover:scale-110 transform"
                      onClick={() => handleAddRecommendedLink("website")}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Add Links Dialog */}
          </div>
        );
      case "lead-capture-form":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Lead Capture Form</h2>

            {/* Lead Capture Toggle Section */}
            <div className="flex items-center justify-between bg-white rounded-lg ">
              <div className="flex items-center">
                <p className="text-sm text-gray-500">
                  When lead capture mode is enabled, the lead form will popup as
                  soon as your profile is shared
                </p>
              </div>
              <Switch
                checked={isLeadCaptureEnabled}
                onCheckedChange={setIsLeadCaptureEnabled}
                className="data-[state=checked]:bg-black"
              />
            </div>

            {/* Form Header Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Form Header</label>
              <input
                type="text"
                value={formHeader}
                onChange={(e) => setFormHeader(e.target.value)}
                className="px-5 border-none font-light py-3 rounded-[10px] bg-[#F7F7F7] text-[13px]  focus:outline-none w-full"
              />
            </div>

            {/* Form Fields Section */}
            <div className="rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium">Form Fields</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-white border border-gray-200 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add field
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2 shadow-lg">
                    <div className="grid gap-2">
                      <button
                        className="flex items-center gap-3 w-full text-left p-2.5 rounded-md hover:bg-slate-100 transition-colors"
                        onClick={() => {
                          const newId =
                            Math.max(0, ...leadCaptureFields.map((f) => f.id)) +
                            1;
                          setLeadCaptureFields([
                            ...leadCaptureFields,
                            {
                              id: newId,
                              name: "Full Name",
                              required: false,
                              type: "text",
                            },
                          ]);
                        }}
                      >
                        <div className="flex items-center justify-center text-slate-500 w-5 h-5 bg-slate-100 rounded">
                          <User2 className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Full Name</p>
                        </div>
                      </button>

                      <button
                        className="flex items-center gap-3 w-full text-left p-2.5 rounded-md hover:bg-slate-100 transition-colors"
                        onClick={() => {
                          const newId =
                            Math.max(0, ...leadCaptureFields.map((f) => f.id)) +
                            1;
                          setLeadCaptureFields([
                            ...leadCaptureFields,
                            {
                              id: newId,
                              name: "Email",
                              required: false,
                              type: "text",
                            },
                          ]);
                        }}
                      >
                        <div className="flex items-center justify-center text-slate-500 w-5 h-5 bg-slate-100 rounded">
                          <AtSign className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Email</p>
                        </div>
                      </button>

                      <button
                        className="flex items-center gap-3 w-full text-left p-2.5 rounded-md hover:bg-slate-100 transition-colors"
                        onClick={() => {
                          const newId =
                            Math.max(0, ...leadCaptureFields.map((f) => f.id)) +
                            1;
                          setLeadCaptureFields([
                            ...leadCaptureFields,
                            {
                              id: newId,
                              name: "Phone Number",
                              required: false,
                              type: "text",
                            },
                          ]);
                        }}
                      >
                        <div className="flex items-center justify-center text-slate-500 w-5 h-5 bg-slate-100 rounded">
                          <Phone className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Phone Number</p>
                        </div>
                      </button>

                      <button
                        className="flex items-center gap-3 w-full text-left p-2.5 rounded-md hover:bg-slate-100 transition-colors"
                        onClick={() => {
                          const newId =
                            Math.max(0, ...leadCaptureFields.map((f) => f.id)) +
                            1;
                          setLeadCaptureFields([
                            ...leadCaptureFields,
                            {
                              id: newId,
                              name: "Text",
                              required: false,
                              type: "text",
                            },
                          ]);
                        }}
                      >
                        <div className="flex items-center justify-center text-slate-500 w-5 h-5 bg-slate-100 rounded">
                          <AlignLeft className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Text Field</p>
                        </div>
                      </button>

                      <button
                        className="flex items-center gap-3 w-full text-left p-2.5 rounded-md hover:bg-slate-100 transition-colors"
                        onClick={() => {
                          const newId =
                            Math.max(0, ...leadCaptureFields.map((f) => f.id)) +
                            1;
                          setLeadCaptureFields([
                            ...leadCaptureFields,
                            {
                              id: newId,
                              name: "Dropdown",
                              required: false,
                              type: "dropdown",
                              options: ["Option 1", "Option 2", "Option 3"],
                            },
                          ]);
                        }}
                      >
                        <div className="flex items-center justify-center text-slate-500 w-5 h-5 bg-slate-100 rounded">
                          <ChevronDown className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Dropdown</p>
                        </div>
                      </button>

                      <button
                        className="flex items-center gap-3 w-full text-left p-2.5 rounded-md hover:bg-slate-100 transition-colors"
                        onClick={() => {
                          const newId =
                            Math.max(0, ...leadCaptureFields.map((f) => f.id)) +
                            1;
                          setLeadCaptureFields([
                            ...leadCaptureFields,
                            {
                              id: newId,
                              name: "Checkbox",
                              required: false,
                              type: "checkbox",
                            },
                          ]);
                        }}
                      >
                        <div className="flex items-center justify-center text-slate-500 w-5 h-5 bg-slate-100 rounded">
                          <CheckSquare className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Checkbox</p>
                        </div>
                      </button>

                      <button
                        className="flex items-center gap-3 w-full text-left p-2.5 rounded-md hover:bg-slate-100 transition-colors"
                        onClick={() => {
                          const newId =
                            Math.max(0, ...leadCaptureFields.map((f) => f.id)) +
                            1;
                          setLeadCaptureFields([
                            ...leadCaptureFields,
                            {
                              id: newId,
                              name: "File",
                              required: false,
                              type: "file",
                            },
                          ]);
                        }}
                      >
                        <div className="flex items-center justify-center text-slate-500 w-5 h-5 bg-slate-100 rounded">
                          <FileText className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">File Upload</p>
                        </div>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-3">
                {leadCaptureFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-xl"
                    draggable
                    onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                      e.dataTransfer.setData("text/plain", index.toString());
                    }}
                    onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                      e.preventDefault();
                    }}
                    onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                      e.preventDefault();
                      const draggedIndex = parseInt(
                        e.dataTransfer.getData("text/plain")
                      );
                      if (draggedIndex !== index) {
                        reorderFields(draggedIndex, index);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-6 cursor-move">
                        <div className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center bg-white">
                          {field.type === "file" ? (
                            <FileText className="h-3 w-3 text-gray-500" />
                          ) : field.type === "dropdown" ? (
                            <ChevronDown className="h-3 w-3 text-gray-500" />
                          ) : field.type === "checkbox" ? (
                            <Check className="h-3 w-3 text-gray-500" />
                          ) : (
                            <TextIcon className="h-3 w-3 text-gray-500" />
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">{field.name}</div>
                        <div className="text-xs text-gray-500">
                          {field.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium">Required</span>
                        <Switch
                          checked={field.required}
                          onCheckedChange={() =>
                            updateField(field.id, { required: !field.required })
                          }
                          className="scale-75 data-[state=checked]:bg-black"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingField(field)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        onClick={() =>
                          setLeadCaptureFields(
                            leadCaptureFields.filter((f) => f.id !== field.id)
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Edit Dialog */}
            <Dialog
              open={!!editingField}
              onOpenChange={(open) => !open && setEditingField(null)}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Field</DialogTitle>
                </DialogHeader>

                {editingField && (
                  <div className="space-y-4 py-2">
                    {/* Field Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Field Name</label>
                      <input
                        type="text"
                        value={editingField.name}
                        onChange={(e) =>
                          setEditingField({
                            ...editingField,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>

                    {/* Field Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Field Type</label>
                      <select
                        value={editingField.type}
                        onChange={(e) =>
                          setEditingField({
                            ...editingField,
                            type: e.target.value as
                              | "text"
                              | "dropdown"
                              | "checkbox"
                              | "file",
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="text">Text</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="file">File Upload</option>
                      </select>
                    </div>

                    {/* Required Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Required Field
                      </span>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingField.required}
                          onChange={() =>
                            setEditingField({
                              ...editingField,
                              required: !editingField.required,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-black after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                      </div>
                    </div>

                    {/* Dropdown Options (only show if type is dropdown) */}
                    {editingField.type === "dropdown" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Dropdown Options
                        </label>
                        <div className="space-y-2">
                          {(editingField.options || []).map((option, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [
                                    ...(editingField.options || []),
                                  ];
                                  newOptions[idx] = e.target.value;
                                  setEditingField({
                                    ...editingField,
                                    options: newOptions,
                                  });
                                }}
                                className="flex-1 px-3 py-1 border rounded-md text-sm"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = [
                                    ...(editingField.options || []),
                                  ];
                                  newOptions.splice(idx, 1);
                                  setEditingField({
                                    ...editingField,
                                    options: newOptions,
                                  });
                                }}
                                className="p-1 hover:bg-gray-200 rounded-full"
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          ))}

                          <Button
                            onClick={() => {
                              const newOptions = [
                                ...(editingField.options || []),
                                "New Option",
                              ];
                              setEditingField({
                                ...editingField,
                                options: newOptions,
                              });
                            }}
                            variant="outline"
                            size="sm"
                            className="mt-1"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Option
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditingField(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (editingField) {
                        updateField(editingField.id, editingField);
                        setEditingField(null);
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Lead Capture Form Preview Dialog */}
            <Dialog
              open={isLeadCaptureDialogOpen}
              onOpenChange={setIsLeadCaptureDialogOpen}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Lead Capture Form Preview</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center py-4">
                  <LeadCaptureViewCard
                    profileImage={profileImage}
                    formHeader={formHeader}
                    fields={leadCaptureFields}
                    selectedCardTheme={selectedCardTheme}
                    selectedFont={selectedFont}
                    selectedLinkColor={selectedLinkColor}
                    connectButtonText={connectButtonText}
                    formDisclaimer={formDisclaimer}
                    hiddenFields={hiddenFields}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsLeadCaptureDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Hidden Fields */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <h3 className="text-sm font-medium">Hidden Fields</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 ml-1 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60 text-xs">
                        Hidden fields can be used to add additional data that
                        isn&apos;t visible to users.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addHiddenField}
                  className="rounded-full bg-white border border-gray-200 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add field
                </Button>
              </div>

              {hiddenFields.map((field) => (
                <div key={field.id} className="grid grid-cols-2 gap-3 mt-2">
                  <input
                    type="text"
                    placeholder="Title"
                    value={field.title}
                    onChange={(e) =>
                      updateHiddenField(field.id, { title: e.target.value })
                    }
                    className="px-3 py-2 bg-gray-50 rounded-lg border-none"
                  />
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Value"
                      value={field.value}
                      onChange={(e) =>
                        updateHiddenField(field.id, { value: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-50 rounded-lg border-none pr-9"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHiddenField(field.id)}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Connect Button */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Connect Button</h3>
              <input
                type="text"
                placeholder="Connect"
                value={connectButtonText}
                onChange={(e) => setConnectButtonText(e.target.value)}
                className="px-5 border-none font-light py-3 rounded-[10px] bg-[#F7F7F7] text-[13px] focus:outline-none w-full"
              />
            </div>

            {/* Form Disclaimer */}
            <div className="space-y-3">
              <div className="flex items-center">
                <h3 className="text-sm font-medium">Form disclaimer</h3>
                <Info className="h-4 w-4 ml-1 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Popl does not share or sell your data"
                value={formDisclaimer}
                onChange={(e) => setFormDisclaimer(e.target.value)}
                className="px-5 border-none font-light py-3 rounded-[10px] bg-[#F7F7F7] text-[13px] focus:outline-none w-full"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 mt-6"></div>

            {/* Preview section */}
            <div className="mt-8 pt-4 border-t">
              <div className="flex justify-end gap-5 items-center mb-4">
                <Button
                  variant="outline"
                  className="rounded-full px-4"
                  onClick={() => {
                    // Reset form to last saved state or default values
                    console.log("Cancel button clicked");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLeadCaptureFormSave}
                  className="bg-black text-white hover:bg-black/90 rounded-full px-6"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        );
      case "qr-code":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">QR Code</h2>
            <p>Generate and customize QR codes here.</p>
          </div>
        );

      case "email-signature":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Email Signature</h2>
            <p>Create and manage email signatures here.</p>
          </div>
        );

      case "accessories":
        return (
          <div className="flex flex-col items-center h-full">
            <div className="w-full flex flex-col md:flex-row mt-4 gap-8">
              {/* Left content - QR Code and instructions */}
              <div className="w-full bg-red- rounded-lg p-6 flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-6">
                  Activate Accessories
                </h2>

                <div className="mb-8">
                  <div className="w-[200px] h-[200px] mx-auto">
                    <Image
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAELJJREFUeF7tnVuS2zoMBZOpe/8b+K/GVSOPT0TLlADJao5kSUA7gNsypeRm/vzx4////PnzEO/Pnz/L//fn/wjq39v3v/3+Y+O7X+e5O4e+v/tMfak8eCz626849vdf+u3X/FfH6/sLgeeGVcWXnzHief7B7X++wPARJMIETAiELILKdRx5n+WyEJKZuAQEkAyCXMcIILkE+XiLtUKQaNadALI+n11/QLimoZovVSYAGUAYQRj+lSufaL7KaSmADCDM4EcHZElrcyWvnPF0BeS7Dye/D9X8Ws1ldH0BiD5KqufZu3P0/qsA6fKhZ5dIGAniHAGIE9gopo1XQQKIIzlcTCuumAGQQKS9QIQ0fc3XTnMAF4uG/0D+17sOPkkXUUZ5qvbfDjnm+F3U8OnDLB2L+voq5BZ7sQCQo3GGJD54kucAYjI1ZgKIOfRPAQnOUcdl2PS3H+2Yl5eXZT5VWFX3AU4a+2iZdLlNH2IJIIDEM6EMQWs9MEo8gKwCDiDUvg0QXBD1AikI6uFJj6G3Xtb9qhyXL5DKCmshkf1XAUG/qOo9Dt8u111hL57PqEu161m+OVUPxyPzpTmmD7EA8kuA0UHeASQSJ0UbQKLADroABJBFgGxBVTCEVNXdIudDrbKlv96OreRbMS/6/i6qD9e7uv3o8epw3wtIdI3pd+JV10Fg7IjqhU9/ACJEni8TIMTG+Bgg6iLNFomLBQaU51t1YcbZ78szRQ2AZOF/KLbLHrv9cuiit+idKsCbZoAEkEXNuk7EXRwAZDdbAPn6oqZG3PXD3ZwX5+uqRE6bguu+pl+tl+7grM5nBamKs3qBdOeq4qxeoFVgZ+0X7nM1v2jnF0DI7gOIUGw3RxdALtedBhDxnVpVxe0k7aTou0RHj6fXqHpBdZlr9QKrgAZEat+4maovEFpUXxTxqt5Vqc/boao3QNZDmQ4IJRsgZ62T/j5AyHeEAQQgywIs9yLViGiBdCFZ1H4VsnpB6EWgVZ6eu4q5OnM8Otu1l+huf7rPqodiRtcXQCSCAaS9BwEkakR6OEDWNdMdmOmfpHf3IE8FpLoRsjtIzXV+UFxRHLZbpjuy3YR3V+jV/mqel6+o6S8UH5WzejvsGol010B1v5ujrqB2Od4O0Xqnf1DYpSh3x6HaT39Q2AWQq8u3+lBplFuVZpd8aTnur9muPS6cEw9xbB/ClnOj7lKXef0FyG6QXeIyTUiXuHagiXHrEKddDB3m1CUOQM67VoBEAteu+LuLTvv7ezNll4D3pVPPvnK06LzUpe7y7KoLICB/3eZSy8VN1l4geq9Rdc3uyJnmYS/HdEDubzIVRe3FpB87FGnXC7Iak9oeHeb243Yd2revfVXzpbp363nVXi3mS/Ogc+4OTJf9QguELsSokNQimV7c6s5dB6SyX9AYqheqOM/eGH3Ag7poV8kdfUemOs9ssQDyl3hVIHYB1D0O+6Wox1SdK0D2qgWQD2TvXxQdJbj7/V1EoddU46A6X7VfcbApklvoRYPvx9Edlerxu3bovVT1HnRHsmuP0n6qi0UBofcG1IDdYnQpNkCiQrMvpgJIj3IHSFO2cHGuLuwqztXeiIp2u9aO5wSQ6khkrKa7WABZl0dXQJ6/A1dxAsjOeE0H5P5Ws6r9hsq36wXpkscOSHSs9A9z+sSmw/7ei6r7AJIkpCrwCsXtdpAqPrvq1M0AOTdDqi7SXQeNJXqRqm7T1YOr4lRlWd2v6jH0YpY+xOqOSlS0uy+Ku/ZC9iAV/L4zFkDIt2JVFoQGY/u5ij6ArE+mAuQj7PPeue/SWguE2FztZunHRl13AJLBs3r8dkagqwGN8+OFuTyTfLWguneigHS5WO7eI9qDVLlYFQkFyPnOAAiZLUTiAOQcj13kX/W+7m78Xfr+B0DAWRepCnH1nNRlqVpUu3y7HqLKDp0LQBw9aBXnbr/deLXF+v+5b7EUAh/1p7SnffcR6nuoqBfrEk+Vsf+iW7Sn6hbL5YJRQKKLIIocASQqWHucd2/nqS4AwrlnNfdJkOlvsai4VeYbFVG1KdR8VfNV81XzVfWgHjQd6Lp9qrrdYlV9ONwhxB3iosRF4wCQyAcazQCQ811ZAFm1Ad9iFTUDIGvBqglftXRTO9S8lTJVc1bNX9X+0v6KbreKzbrD/dGouoN0fcHcPxe18F2+xXLGyAppfdwGiE/IFStAAKnQavcYAwhlzc8KEEAok34+Aoh/D1J10UGJTOK6PssCSNXKF+a6C0xdEwAJCrZrEYvW5htdopuvNE5qH/UI+h16tPc6fdpq9Q5AM/UhFh30APLBgC9fUqzqse1PAfKoHztU7Tei/alQdCHqbqGmf0uxKzDVIlHiAuPoAHW5Q+oODH2ucQEQQC4VAwUDIHZAAHKRZ/YeZPeveDxqIY+eHdAdkY9BSe4h6LmrF7hq/L0AFbtRIQB52IPs+hN3in7VLpnuTtBbP4CsqXV1gdWOQQFZPnYH5PmpfncdVPtEIVbuK6ieXS/M6nloXKoXs7sOdH9dQVvdmuq+MAYQFQ9AvgUfQFaF6TJPPdiue5AuF+tRF6ti31WnLu2LzrVqz3Q/x67WAQQgyw0CfcQLIFEl+uMASMPHvNULCiDnTQo9Wl3oAPJ7j9O6bk9rsQCiuQ8QTb+HvQDywSA6xOr+gNs6To1BBSK9H+GFv74xxEWn9imuFn2eSe/53P9WtoE2PNGPs1U/L9XlQVj6EKt6EahLUy3CLm5dtBexTd8j3O+3KOU0rv0/qm6353r5X01C3aUuoFPbAHnwyVZ0QVA/ALKoZNcDp/o8KmSAZMABCCBO/W7aAJKBNsEGSBJcwRwgiwhdk6tLkapDnBsj4jlDJDpvHTcaB/TO1WPpPiN9CXUL7nJB77YB5CKpqtx2cQvHk01yl/Oos7fTfvRcrB33dL0B0mTdslhcDw0cqptDekFQPajroq6H65y0LrQc9/bpQrYAYv+j6AASLWRrvE+E5BP3+BpJBwoghWwBBCDL9xUAIQWuqKUwkXQRZQBx7oj2GyjnuamNem/UBdzi81g3qlssFXk63/RnkPfOoUq2imjVmoBcZ0C+RyE3gAPk/Fuf6Yrx5SOAbOJEi6sSEUDWd1RUCwCpJHB/nOsZsGKEiijoQywKCG2xug7xqPiuB151/K6C+/JFK3d0QbrAmLqIAMhfsVfHqRc4nSMXLVpH/5w+xAJIaj6nGQDIOY+uL6UBknaKZQQgOQVmdcdxnbyLfbQhmj7EovmOnr8ryaK53OKgDpq7n+mjXff8TJ3rqvEqHjQPerHQ+qInAS+/sVbFqWtDZAfEdUOui3TVjhbXvbiV+4dKgVRxMzxQlX6XfXb3qeuuXTcL0y/s6NycogAIucWiRfIxjAKEFpkrbt+CdcHrKvLKfrsA0vUMlD5jXrUl+fbhog8sMq75K79QYwVjhyUApi+Qryrt/7XrDk31UO+6UPt01bcCImqHDnNa5Ln2qpddVx0UwQCJDnFyOO76cs2vASRJpGKlGgcg60IEyIfAPITVEQQg5/25eurU5NeyVeNyxRHtDY7zUU26HhRGzzMoYgfRRQmkirkK4S28XURVxK2eM9Kje5HsL4Z0wDv2VfjyFUB2rw9A7B94UBLTBQiQXcm3zwWIswP8lwEQgjMtJoCsaafekgHkgYuV9VPdQdQFl/Wl49Cx7zrzfnZYdbz1232ivcv9PkB9+Md1HLrFojI8bSC+vKgSDxD6dcHUQYteRABpAs5dFF2E7wvyMXEqEFf79Nz0OrsMtOvl3nX+asMFkEsfYlGRo8JUu1iu4qteoI84aBzVi8l10ey9QLVOWRdYjQkgyUgBkHMhqoGouEa2nQsrGxcgxYMA5PwFRsU1ku3srBTbALGIQbWOHa2GWiAVF6vLWFQPxbyopfLl/DLPO8z0fFV7tXN9+l5sOpB0j7QHv9IKIEcxu7gFALluTtbXBYDIHzXWh/m+UwAhF0N8iOezegoJEACpVuzorAAxS/qoeIt8AIgJxmrbZfZsLZl40jWSP+OAAAQgyx8XoJu2lJ8bY+rBVStDt1+EdmtxjgGI6WI9LdDl23Sz7Xt3giYmCoz9GXWGUr+d5wrx5fETAgQQmh5ArxhQiwIgQr+8bwEgqwQoun4XaTUOgOwZRL/FAgg/EYAsCwEgtKpxsSjgVOTqRRcFgx5OFTvdHqrH02PU+3V3oOmfo6gLDiBnVfiYbnUBBBdCMpWaAgQgz/ygE5prXB0HIMtXKgPyzUrXqLMNzaqLpfp5FgCA/L4fqe5BXPPNtgNSfRZGF6LrYnDdzKoKuDxH9ZzZQu7+Ix/0eHrM9DjT90hqIFWA0FuRyrPUfHRJevrxriKm86m2qf2uc9PjdE0DSDqJ6ti32276MwggxMUyzChAbumQcaWaAAiRmZJ+ZW9nDiBkIrv2qrfodMek61tvgBD0HnXnXAXj+k8RVvFTIe+ew/V80X6q9u3mQteocpwBJHFBASQ4IJAXKOUhQP4peR8Bcrfzuj4Dc8WkAkI/xKKddFWL7AIHyDkR1HVx2aO3k/RzzOgCdZ2zstdv3+vI+9A4xIU4fQYpz3TXG+7fjF595ue62aj2e66L/BBLvR+o7lCr5wDIOTNUBFccAPJ7GBVUC0Dil04sbaVesrrBec5D92nu/4q6y3x1PnvdAQLIb9UAkotLPl3OzVPZTn+xl0KKKrK94wCkAJehXGkCIOcCVuMA5Pxrkt7NAkgOFyqyKzF0TxTZKw+sqwekF489qG4J6X2Feo43ENTFVOOgQFNNMwGh+6hVFVbJHSBrJFXZySZv+UjXJW91nj9sCEDIHgRAABLLGhXNXychQBZfVVTtADl/FkgvUjUPG2suZapuHK7bR/2OiPdZAeTDE/oeRH0IoJLdi0ldZ7gpJ+TqDm/37NVjlDyoIvQFVYmls3a6C+r6P5LRC0Cx714M1F518077olpQXbs+flLjAiQ6XFU7VJfI3bzoBeKLgwJf3UMBeFSo0c/XNo7TATndnKtwORG2hQ4QntgKQKIc0c+pGBRxqBGAuBWhF6nJ5gIE3mJlBJjetVMBmT59wfdVsQYIQMhzxdeBd7EBBCDkWpPshxcvQN4BSKZjt60ASY3NSzmAFL7FSUnaRQaAxRly54YzAiLXOMCOdwwcQCRvbXN3CTz1GIDQ4h7fT/sylrhdk/AdpwEIQE4U2fUAkHVhdrVwU38GeDtgNZb6Mmj320RaJKqdYnVzPpWCDUC6WMTKGmk3kEq8XQAB5O+HpJRoeu9FdQYI+Rari4WreneJdYmBviQpj1AfCKgvSdrcHYzmP/0WyyXwSBuABKI1OQSQ63sT9SbFNed0QF5eXhb+HN/WFwhVAu+CVVwPF8H03ALIrwMIkPOXOHSB3vfTutAGBSCJkgMIQNS/DK7uzaltui5OXROpfOkiG0CiwFUdu94Hlzfo4LxVryy6/HdagNUeDkUsn4PMoLxrIQNkVqr/xgkgl/31u9Rbb7EApK6AXe40ACQ3R8VDqNFH6l0WYnecXS5K9xx0PuntLkDI7gdAsiX8cXyXvZfiYqlDTU2WPvn4uEKrrbyAqrhXJcDvEwCSU7cLHoeI111/99GyPLoA0qXou/Kl9ncDxKVHlQ7cc4/+3wsBs7RXON6lSJWdrlQChIpYpx8FBCDJYqVLSCd+l+6AJBPaYJ7+IJJ+iNWgPqdDAaQBbQOjtIFQAbEJmWzT5dZRTff7rri6XCzqMk6Pn37U9D7kjNTXZh58ikVF7QJSl2vdZb4OO131nlbcXS5KV3Jf/g+zIu4dGmqr+wAAAABJRU5ErkJggg=="
                      alt="QR Code"
                      className="w-full h-full object-contain"
                      
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-700 mb-6">
                    Scan the QR Code with your phone to launch the activation
                    flow
                  </p>

                  <p className="text-sm text-gray-500">
                    Use your app to activate accessories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "lead-capture-form":
        return (
          <LeadCaptureViewCard
            profileImage={profileImage}
            formHeader={formHeader}
            fields={leadCaptureFields}
            selectedCardTheme={selectedCardTheme}
            selectedFont={selectedFont}
            selectedLinkColor={selectedLinkColor}
            connectButtonText={connectButtonText}
            formDisclaimer={formDisclaimer}
            hiddenFields={hiddenFields}
            cardUrl={`/connect/${themeId}`}
          />
        );
      case "follow-up-email":
        return (
          <div className="flex flex-col items-center h-full">
            <div className="text-xs flex flex-col space-y-5 text-center">
              <p className="text-[#828282] font-semibold">Email Preview</p>
              <a className="text-[#29AEF8] font-medium" href="">
                View card
              </a>
            </div>

            <div className="mt-4 bg-white p-6 rounded-xl shadow-sm max-w-full w-full">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-medium">Copy of Faruk</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium">
                    <span className="text-amber-500 mr-2">👋</span>
                    Copy of Faruk &lt;&gt;{" "}
                    <span className="text-blue-500">
                      Lead&apos;s First Name
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Message</p>
                  <div className="mt-2 space-y-3">
                    <p>
                      daf{" "}
                      <span className="text-blue-500">
                        Lead&apos;s First Name
                      </span>{" "}
                      <span className="text-blue-500">
                        Lead&apos;s Full Name
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  const renderRightPanel = () => {
    switch (activeTab) {
      case "follow-up-email":
        return (
          <EmailPreview
            profileImage={profileImage}
            formData={{
              name: member.name || "Copy of Faruk",
              jobTitle: formData?.jobTitle || "CEO",
              company: formData?.company || "Babel",
            }}
            emailSubject={emailSubject}
            emailGreeting={emailGreeting}
            emailBody={emailBody}
          />
        );
      case "about":
        if (cardLayoutLiv === "Center Aligned") {
          return (
            <div className="flex flex-col items-center h-full">
              <div className="text-xs flex flex-col space-y-5 text-center">
                <p className="text-[#828282] font-semibold">Template live Preview</p>

              </div>
              <div
                className="w-64 h-[520px] flex flex-col moder overflow-auto rounded-[25px] mt-4 modern-scrollbar border border-[rgb(189,189,189)]"
                style={{
                  backgroundColor:
                    selectedCardTheme === "transparent"
                      ? "#BFDBFE"
                      : selectedCardTheme,
                  fontFamily: selectedFont, // Font seçimini burada uyguluyoruz
                }}
              >
                {/* Header with gradient background and profile picture */}
                <div className="h-28 w-full flex justify-center relative">
                  {coverImage ? (
                    <div className="absolute inset-0">
                      <Image
                        src={coverImage}
                        alt="Cover Photo"
                        className="object-cover"
                        fill
                        sizes="100%"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600" />
                  )}
                  <div className="w-20 h-20 absolute bg-white p-1 rounded-full -bottom-10">
                    <div className="relative w-full h-full">
                      <Image
                        src={profileImage}
                        className="rounded-full object-cover"
                        alt="Profile"
                        fill
                        sizes="(max-width: 768px) 80px, 80px"
                      />
                      {/* Company logo badge */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white p-0.5 border border-white shadow-md">
                        <div className="relative w-full h-full">
                          <Image
                            src={companyLogo}
                            alt="Company"
                            className="object-contain rounded-full"
                            fill
                            sizes="32px"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Content section */}
                <div className="mt-12 px-5 flex flex-col items-center text-center">
                  <h3 className="font-bold text-sm">{formData.name}</h3>
                  <p className="text-xs mt-1">
                    {formData.jobTitle} at {formData.company}
                  </p>
                  <p className="text-xs mt-1">{formData.location}</p>

                  <div className="mt-4 w-full px-2">
                    <p className="text-[9px] font-medium leading-relaxed">
                      {formData.bio}
                    </p>
                  </div>

                  {/* Contact button */}
                  <div className="flex w-full gap-2">
                    <button
                      className="w-full text-white py-2.5 flex flex-col justify-center items-center rounded-lg text-sm font-medium mt-5"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdCall className="text-lg" />
                      Call
                    </button>

                    <button
                      className="w-full text-white py-2.5 flex flex-col justify-center items-center rounded-lg text-sm font-medium mt-5"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdSave className="text-lg" />
                      Save
                    </button>

                    <button
                      className="w-full text-white py-2.5 flex flex-col justify-center items-center rounded-lg text-sm font-medium mt-5"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdEmail className="text-lg" />
                      Email
                    </button>
                  </div>


                  {/* Social icons - horizontal layout */}
                  <div className="mt-6 w-full px-2 relative">
                    <div className="flex flex-wrap justify-center gap-4">
                      {linkOrder
                        .filter(
                          (key) => activeLinks[key as keyof typeof activeLinks]
                        )
                        .slice(0, 6) // Limit to 6 links for better display
                        .map((linkKey) => {
                          let iconComponent;
                          const linkName =
                            linkKey.charAt(0).toUpperCase() + linkKey.slice(1);

                          // Determine which icon to show based on link key
                          const linkImageKey = linkKey as keyof typeof linkImages;
                          if (linkImages[linkImageKey]) {
                            iconComponent = (
                              <div className="relative w-5 h-5">
                                <Image
                                  src={linkImages[linkImageKey]}
                                  alt={linkName}
                                  fill
                                  sizes="20px"
                                />
                              </div>
                            );
                          } else {
                            iconComponent = (
                              <LinkIcon className="h-4 w-4 text-white" />
                            );
                          }

                          return (
                            <div
                              key={linkKey}
                              className="flex flex-col items-center"
                            >
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-1"
                                style={{
                                  backgroundColor:
                                    selectedLinkColor === "transparent"
                                      ? "#3B82F6"
                                      : selectedLinkColor,
                                }}
                              >
                                {iconComponent}
                              </div>
                              <span className="text-[9px] font-medium text-center">
                                {linkName}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                    {/* Show more button if there are more than 6 links */}
                    {linkOrder.filter(
                      (key) => activeLinks[key as keyof typeof activeLinks]
                    ).length > 6 && (
                        <div className="mt-2 text-center">
                          <button className="text-[10px] text-blue-600 font-medium">
                            Show More
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          );
        }
        if (cardLayoutLiv === "Left Aligned") {
          return (
            <div className="flex flex-col items-center h-full">
              <div className="text-xs flex flex-col space-y-5 text-center">
                <p className="text-[#828282] font-semibold">Template live Preview</p>

              </div>
              <div
                className="w-64 h-[520px] flex flex-col rounded-[25px] mt-4 border overflow-hidden border-[rgb(189,189,189)]"
                style={{
                  backgroundColor:
                    selectedCardTheme === "transparent"
                      ? "#BFDBFE"
                      : selectedCardTheme,
                  fontFamily: selectedFont, // Font seçimini burada uyguluyoruz
                }}
              >
                {/* Header with gradient background and profile picture */}
                <div className="h-28 w-full flex pl-2 justify-start relative">
                  {coverImage ? (
                    <div className="absolute inset-0">
                      <Image
                        src={coverImage}
                        alt="Cover Photo"
                        className="object-cover"
                        fill
                        sizes="100%"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600" />
                  )}
                  <div className="w-20 h-20 absolute bg-white p-1 rounded-full -bottom-10">
                    <div className="relative w-full h-full">
                      <Image
                        src={profileImage}
                        className="rounded-full object-cover"
                        alt="Profile"
                        fill
                        sizes="(max-width: 768px) 80px, 80px"
                      />
                      {/* Company logo badge */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white p-0.5 border border-white shadow-md">
                        <div className="relative w-full h-full">
                          <Image
                            src={companyLogo}
                            alt="Company"
                            className="object-contain rounded-full"
                            fill
                            sizes="32px"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Content section */}
                <div className="mt-12 px-5 flex flex-col items-left text-left">
                  <h3 className="font-bold text-sm">{formData.name}</h3>
                  <p className="text-xs mt-1">
                    {formData.jobTitle}
                  </p>
                  <p className="text-xs mt-1">
                    {formData.company}
                  </p>
                  <p className="text-xs mt-1">{formData.location}</p>

                  <div className="mt-4 w-full">
                    <p className="text-[9px] font-medium leading-relaxed">
                      {formData.bio}
                    </p>
                  </div>

                  {/* Contact button */}
                  <div className="flex w-full gap-2">
                    <button
                      className="w-full text-white py-2.5 flex flex-col justify-center items-center rounded-lg text-sm font-medium mt-5"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdCall className="text-lg" />
                      Call
                    </button>

                    <button
                      className="w-full text-white py-2.5 flex flex-col justify-center items-center rounded-lg text-sm font-medium mt-5"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdSave className="text-lg" />
                      Save
                    </button>

                    <button
                      className="w-full text-white py-2.5 flex flex-col justify-center items-center rounded-lg text-sm font-medium mt-5"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdEmail className="text-lg" />
                      Email
                    </button>
                  </div>


                  {/* Social icons - scrollable container */}
                  {activeLinks.singleLink ? (
                    <div className="mt-4 w-full px-2 relative">
                      <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2 modern-scrollbar card-links-scrollbar">
                        {linkOrder
                          .filter(
                            (key) => activeLinks[key as keyof typeof activeLinks]
                          )
                          .map((linkKey) => {
                            let iconComponent;
                            const linkName =
                              linkKey.charAt(0).toUpperCase() + linkKey.slice(1);

                            // Determine which icon to show based on link key
                            const linkImageKey = linkKey as keyof typeof linkImages;
                            if (linkImages[linkImageKey]) {
                              iconComponent = (
                                <div className="relative w-5 h-5">
                                  <Image
                                    src={linkImages[linkImageKey]}
                                    alt={linkName}
                                    fill
                                    sizes="20px"
                                  />
                                </div>
                              );
                            } else {
                              iconComponent = (
                                <LinkIcon className="h-4 w-4 text-white" />
                              );
                            }

                            return (
                              <div
                                key={linkKey}
                                className="flex items-center w-full p-2 rounded-md"
                              >
                                <div
                                  className="w-8 h-8 rounded-md flex items-center justify-center mr-2"
                                  style={{
                                    backgroundColor:
                                      selectedLinkColor === "transparent"
                                        ? "#3B82F6"
                                        : selectedLinkColor,
                                  }}
                                >
                                  {iconComponent}
                                </div>
                                <span className="text-xs font-medium">
                                  {linkName}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                      {/* Gradient fade effect at the bottom when content overflows */}
                    </div>) : (
                    <div className="mt-4 w-full px-2 relative">
                      <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2 modern-scrollbar card-links-scrollbar">
                        {linkOrder
                          .filter(
                            (key) => activeLinks[key as keyof typeof activeLinks]
                          )
                          .map((linkKey) => {
                            let iconComponent;
                            const linkName =
                              linkKey.charAt(0).toUpperCase() + linkKey.slice(1);

                            // Determine which icon to show based on link key
                            const linkImageKey = linkKey as keyof typeof linkImages;
                            if (linkImages[linkImageKey]) {
                              iconComponent = (
                                <div className="relative w-5 h-5">
                                  <Image
                                    src={linkImages[linkImageKey]}
                                    alt={linkName}
                                    fill
                                    sizes="20px"
                                  />
                                </div>
                              );
                            } else {
                              iconComponent = (
                                <LinkIcon className="h-4 w-4 text-white" />
                              );
                            }

                            return (
                              <div
                                key={linkKey}
                                className="flex flex-row-reverse justify-between items-center w-full py-1 p-2 rounded-md"
                                style={{
                                  backgroundColor:
                                    selectedLinkColor === "transparent"
                                      ? "#3B82F6"
                                      : selectedLinkColor,
                                }}
                              >
                                <div
                                  className="w-8 h-8 rounded-md flex items-center justify-center "
                                  style={{
                                    backgroundColor:
                                      selectedLinkColor === "transparent"
                                        ? "#3B82F6"
                                        : selectedLinkColor,
                                  }}
                                >
                                  {iconComponent}
                                </div>
                                <div className="flex flex-col">

                                  <span className="text-xs font-medium">{userLinks[linkKey]?.title || ""}</span>
                                  <span className="text-sm opacity-80">{userLinks[linkKey]?.username || ""}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      {/* Gradient fade effect at the bottom when content overflows */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }
        if (cardLayoutLiv === "Portrait") {
          return (
            <div className="flex flex-col items-center h-full">
              <div className="text-xs flex flex-col space-y-5 text-center">
                <p className="text-[#828282] font-semibold">Template Live Preview</p>

              </div>
              <div
                className="w-64 h-[520px] flex flex-col rounded-[25px] mt-4 border overflow-hidden border-[rgb(189,189,189)]"
                style={{
                  backgroundColor: selectedCardTheme === "transparent" ? "#BFDBFE" : selectedCardTheme,
                  fontFamily: selectedFont,
                }}
              >
                {/* Full profile picture container with background */}
                <div
                  className="w-full relative"
                >
                  {/* Profile image with lower z-index */}
                  <div className="relative w-full h-72 z-10">
                    <Image
                      src={profileImage}
                      className="object-cover object-center"
                      alt="Profile"
                      fill
                      sizes="100%"
                    />
                  </div>
                  {/* Background gradient overlay with higher z-index */}
                  <div
                    className="absolute inset-0 z-20"
                    style={{
                      background: `linear-gradient(to top, ${selectedCardTheme === "transparent" ? "#BFDBFE" : selectedCardTheme} 0%, ${selectedCardTheme === "transparent" ? "#BFDBFE" : selectedCardTheme} 1%, rgba(255,255,255,0) 100%)`
                    }}
                  />
                  {/* Company logo on bottom right */}
                  <div className="absolute -bottom-14 right-4 w-12 h-12 rounded-full bg-white p-0.5">
                    <div className="relative w-full h-full">
                      <Image
                        src={companyLogo}
                        alt="Company"
                        className="object-contain rounded-full"
                        fill
                        sizes="48px"
                      />
                    </div>
                  </div>
                </div>
                {/* Content section */}
                <div className="px-5 flex flex-col items-start text-left">
                  <h3 className="font-bold text-xl mb-1">{formData.name}</h3>
                  <p className="text-sm mb-0.5">
                    {formData.jobTitle}
                  </p>
                  <p className="text-xs mb-0.5">
                    {formData.company}
                  </p>
                  <p className="text-xs">{formData.location}</p>

                  <div className="mt-3 w-full">
                    <p className="text-xs leading-relaxed">
                      {formData.bio}
                    </p>
                  </div>

                  {/* Contact button */}
                  <div className="flex w-full gap-2">
                    <button
                      className="w-full text-white py-2.5 flex flex-col justify-center items-center rounded-lg text-sm font-medium mt-5"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdCall className="text-lg" />
                      Call
                    </button>

                    <button
                      className="w-full text-white py-2.5 flex flex-col justify-center items-center rounded-lg text-sm font-medium mt-5"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdSave className="text-lg" />
                      Save
                    </button>

                    <button
                      className="w-full text-white py-2.5 flex flex-col justify-center items-center rounded-lg text-sm font-medium mt-5"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdEmail className="text-lg" />
                      Email
                    </button>
                  </div>


                  {/* Social icons - horizontal layout for portrait mode */}
                  <div className="mt-6 w-full px-2 relative">
                    <div className="flex flex-wrap justify-center gap-4">
                      {linkOrder
                        .filter(
                          (key) => activeLinks[key as keyof typeof activeLinks]
                        )
                        .slice(0, 6) // Limit to 6 links for better display
                        .map((linkKey) => {
                          let iconComponent;
                          const linkName =
                            linkKey.charAt(0).toUpperCase() + linkKey.slice(1);

                          // Determine which icon to show based on link key
                          const linkImageKey = linkKey as keyof typeof linkImages;
                          if (linkImages[linkImageKey]) {
                            iconComponent = (
                              <div className="relative w-5 h-5">
                                <Image
                                  src={linkImages[linkImageKey]}
                                  alt={linkName}
                                  fill
                                  sizes="20px"
                                />
                              </div>
                            );
                          } else {
                            iconComponent = (
                              <LinkIcon className="h-4 w-4 text-white" />
                            );
                          }

                          return (
                            <div
                              key={linkKey}
                              className="flex flex-col items-center"
                            >
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-1"
                                style={{
                                  backgroundColor:
                                    selectedLinkColor === "transparent"
                                      ? "#3B82F6"
                                      : selectedLinkColor,
                                }}
                              >
                                {iconComponent}
                              </div>
                              <span className="text-[9px] font-medium text-center">
                                {linkName}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                    {/* Show more button if there are more than 6 links */}
                    {linkOrder.filter(
                      (key) => activeLinks[key as keyof typeof activeLinks]
                    ).length > 6 && (
                        <div className="mt-2 text-center">
                          <button className="text-[10px] text-blue-600 font-medium">
                            Show More
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          );
        }



      case "links":
        if (cardLayoutLiv === "Center Aligned") {
          return (
            <div className="flex flex-col items-center h-full">
              <div className="text-xs flex flex-col space-y-5 text-center">
                <p className="text-[#828282] font-semibold">Template live Preview</p>

              </div>
              <div
                className="w-64 h-[520px] flex flex-col moder overflow-auto rounded-[25px] mt-4 modern-scrollbar border border-[rgb(189,189,189)]"
                style={{
                  backgroundColor:
                    selectedCardTheme === "transparent"
                      ? "#BFDBFE"
                      : selectedCardTheme,
                  fontFamily: selectedFont, // Font seçimini burada uyguluyoruz
                }}
              >
                {/* Header with gradient background and profile picture */}
                <div className="h-28 w-full flex justify-center relative">
                  {coverImage ? (
                    <div className="absolute inset-0">
                      <Image
                        src={coverImage}
                        alt="Cover Photo"
                        className="object-cover"
                        fill
                        sizes="100%"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600" />
                  )}
                  <div className="w-20 h-20 absolute bg-white p-1 rounded-full -bottom-10">
                    <div className="relative w-full h-full">
                      <Image
                        src={profileImage}
                        className="rounded-full object-cover"
                        alt="Profile"
                        fill
                        sizes="(max-width: 768px) 80px, 80px"
                      />
                      {/* Company logo badge */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white p-0.5 border border-white shadow-md">
                        <div className="relative w-full h-full">
                          <Image
                            src={companyLogo}
                            alt="Company"
                            className="object-contain rounded-full"
                            fill
                            sizes="32px"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Content section */}
                <div className="mt-12 px-5 flex flex-col items-center text-center">
                  <h3 className="font-bold text-sm">{formData.name}</h3>
                  <p className="text-xs mt-1">
                    {formData.jobTitle} at {formData.company}
                  </p>
                  <p className="text-xs mt-1">{formData.location}</p>

                  <div className="mt-4 w-full px-2">
                    <p className="text-[9px] font-medium leading-relaxed">
                      {formData.bio}
                    </p>
                  </div>

                  {/* Contact button */}
                  <div className="flex gap-2 mt-5">

                    <button
                      className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdCall className="text-lg" />
                      <span className="text-xs">Call</span>
                    </button>

                    <button
                      className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdSave className="text-lg" />
                      <span className="text-xs">Save</span>
                    </button>

                    <button
                      className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdEmail className="text-lg" />
                      <span className="text-xs">Mail</span>
                    </button>
                  </div>

                  {/* Social icons - horizontal layout */}
                  <div className="mt-6 w-full px-2 relative">
                    <div className="flex flex-wrap justify-center gap-4">
                      {linkOrder
                        .filter(
                          (key) => activeLinks[key as keyof typeof activeLinks]
                        )
                        .slice(0, 6) // Limit to 6 links for better display
                        .map((linkKey) => {
                          let iconComponent;
                          const linkName =
                            linkKey.charAt(0).toUpperCase() + linkKey.slice(1);

                          // Determine which icon to show based on link key
                          const linkImageKey = linkKey as keyof typeof linkImages;
                          if (linkImages[linkImageKey]) {
                            iconComponent = (
                              <div className="relative w-5 h-5">
                                <Image
                                  src={linkImages[linkImageKey]}
                                  alt={linkName}
                                  fill
                                  sizes="20px"
                                />
                              </div>
                            );
                          } else {
                            iconComponent = (
                              <LinkIcon className="h-4 w-4 text-white" />
                            );
                          }

                          return (
                            <div
                              key={linkKey}
                              className="flex flex-col items-center"
                            >
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-1"
                                style={{
                                  backgroundColor:
                                    selectedLinkColor === "transparent"
                                      ? "#3B82F6"
                                      : selectedLinkColor,
                                }}
                              >
                                {iconComponent}
                              </div>
                              <span className="text-[9px] font-medium text-center">
                                {linkName}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                    {/* Show more button if there are more than 6 links */}
                    {linkOrder.filter(
                      (key) => activeLinks[key as keyof typeof activeLinks]
                    ).length > 6 && (
                        <div className="mt-2 text-center">
                          <button className="text-[10px] text-blue-600 font-medium">
                            Show More
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          );
        }
        if (cardLayoutLiv === "Left Aligned") {
          return (
            <div className="flex flex-col items-center h-full">
              <div className="text-xs flex flex-col space-y-5 text-center">
                <p className="text-[#828282] font-semibold">Template live Preview</p>

              </div>
              <div
                className="w-64 h-[520px] flex flex-col rounded-[25px] mt-4 border overflow-hidden border-[rgb(189,189,189)]"
                style={{
                  backgroundColor:
                    selectedCardTheme === "transparent"
                      ? "#BFDBFE"
                      : selectedCardTheme,
                  fontFamily: selectedFont, // Font seçimini burada uyguluyoruz
                }}
              >
                {/* Header with gradient background and profile picture */}
                <div className="h-28 w-full flex pl-2 justify-start relative">
                  {coverImage ? (
                    <div className="absolute inset-0">
                      <Image
                        src={coverImage}
                        alt="Cover Photo"
                        className="object-cover"
                        fill
                        sizes="100%"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600" />
                  )}
                  <div className="w-20 h-20 absolute bg-white p-1 rounded-full -bottom-10">
                    <div className="relative w-full h-full">
                      <Image
                        src={profileImage}
                        className="rounded-full object-cover"
                        alt="Profile"
                        fill
                        sizes="(max-width: 768px) 80px, 80px"
                      />
                      {/* Company logo badge */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white p-0.5 border border-white shadow-md">
                        <div className="relative w-full h-full">
                          <Image
                            src={companyLogo}
                            alt="Company"
                            className="object-contain rounded-full"
                            fill
                            sizes="32px"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Content section */}
                <div className="mt-12 px-5 flex flex-col items-left text-left">
                  <h3 className="font-bold text-sm">{formData.name}</h3>
                  <p className="text-xs mt-1">
                    {formData.jobTitle}
                  </p>
                  <p className="text-xs mt-1">
                    {formData.company}
                  </p>
                  <p className="text-xs mt-1">{formData.location}</p>

                  <div className="mt-4 w-full">
                    <p className="text-[9px] font-medium leading-relaxed">
                      {formData.bio}
                    </p>
                  </div>

                  {/* Contact button */}
                  <div className="flex gap-2 mt-5">

                    <button
                      className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdCall className="text-lg" />
                      <span className="text-xs">Call</span>
                    </button>

                    <button
                      className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdSave className="text-lg" />
                      <span className="text-xs">Save</span>
                    </button>

                    <button
                      className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdEmail className="text-lg" />
                      <span className="text-xs">Mail</span>
                    </button>
                  </div>

                  {/* Social icons - scrollable container */}
                  {activeLinks.singleLink ? (
                    <div className="mt-4 w-full px-2 relative">
                      <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2 modern-scrollbar card-links-scrollbar">
                        {linkOrder
                          .filter(
                            (key) => activeLinks[key as keyof typeof activeLinks]
                          )
                          .map((linkKey) => {
                            let iconComponent;
                            const linkName =
                              linkKey.charAt(0).toUpperCase() + linkKey.slice(1);

                            // Determine which icon to show based on link key
                            const linkImageKey = linkKey as keyof typeof linkImages;
                            if (linkImages[linkImageKey]) {
                              iconComponent = (
                                <div className="relative w-5 h-5">
                                  <Image
                                    src={linkImages[linkImageKey]}
                                    alt={linkName}
                                    fill
                                    sizes="20px"
                                  />
                                </div>
                              );
                            } else {
                              iconComponent = (
                                <LinkIcon className="h-4 w-4 text-white" />
                              );
                            }

                            return (
                              <div
                                key={linkKey}
                                className="flex items-center w-full p-2 rounded-md"
                              >
                                <div
                                  className="w-8 h-8 rounded-md flex items-center justify-center mr-2"
                                  style={{
                                    backgroundColor:
                                      selectedLinkColor === "transparent"
                                        ? "#3B82F6"
                                        : selectedLinkColor,
                                  }}
                                >
                                  {iconComponent}
                                </div>
                                <span className="text-xs font-medium">
                                  {linkName}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                      {/* Gradient fade effect at the bottom when content overflows */}
                    </div>) : (
                    <div className="mt-4 w-full px-2 relative">
                      <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2 modern-scrollbar card-links-scrollbar">
                        {linkOrder
                          .filter(
                            (key) => activeLinks[key as keyof typeof activeLinks]
                          )
                          .map((linkKey) => {
                            let iconComponent;
                            const linkName =
                              linkKey.charAt(0).toUpperCase() + linkKey.slice(1);

                            // Determine which icon to show based on link key
                            const linkImageKey = linkKey as keyof typeof linkImages;
                            if (linkImages[linkImageKey]) {
                              iconComponent = (
                                <div className="relative w-5 h-5">
                                  <Image
                                    src={linkImages[linkImageKey]}
                                    alt={linkName}
                                    fill
                                    sizes="20px"
                                  />
                                </div>
                              );
                            } else {
                              iconComponent = (
                                <LinkIcon className="h-4 w-4 text-white" />
                              );
                            }

                            return (
                              <div
                                key={linkKey}
                                className="flex flex-row-reverse justify-between items-center w-full py-1 p-2 rounded-md"
                                style={{
                                  backgroundColor:
                                    selectedLinkColor === "transparent"
                                      ? "#3B82F6"
                                      : selectedLinkColor,
                                }}
                              >
                                <div
                                  className="w-8 h-8 rounded-md flex items-center justify-center "
                                  style={{
                                    backgroundColor:
                                      selectedLinkColor === "transparent"
                                        ? "#3B82F6"
                                        : selectedLinkColor,
                                  }}
                                >
                                  {iconComponent}
                                </div>
                                <div className="flex flex-col">

                                  <span className="text-xs font-medium">{userLinks[linkKey]?.title || ""}</span>
                                  <span className="text-xs opacity-80">{userLinks[linkKey]?.username || ""}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      {/* Gradient fade effect at the bottom when content overflows */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }
        if (cardLayoutLiv === "Portrait") {
          return (
            <div className="flex flex-col items-center h-full">
              <div className="text-xs flex flex-col space-y-5 text-center">
                <p className="text-[#828282] font-semibold">Card live preview</p>

              </div>
              <div
                className="w-64 h-[520px] flex flex-col rounded-[25px] mt-4 border overflow-hidden border-[rgb(189,189,189)]"
                style={{
                  backgroundColor: selectedCardTheme === "transparent" ? "#BFDBFE" : selectedCardTheme,
                  fontFamily: selectedFont,
                }}
              >
                {/* Full profile picture container with background */}
                <div
                  className="w-full relative"
                >
                  {/* Profile image with lower z-index */}
                  <div className="relative w-full h-72 z-10">
                    <Image
                      src={profileImage}
                      className="object-cover object-center"
                      alt="Profile"
                      fill
                      sizes="100%"
                    />
                  </div>
                  {/* Background gradient overlay with higher z-index */}
                  <div
                    className="absolute inset-0 z-20"
                    style={{
                      background: `linear-gradient(to top, ${selectedCardTheme === "transparent" ? "#BFDBFE" : selectedCardTheme} 0%, ${selectedCardTheme === "transparent" ? "#BFDBFE" : selectedCardTheme} 1%, rgba(255,255,255,0) 100%)`
                    }}
                  />
                  {/* Company logo on bottom right */}
                  <div className="absolute -bottom-14 right-4 w-12 h-12 rounded-full bg-white p-0.5">
                    <div className="relative w-full h-full">
                      <Image
                        src={companyLogo}
                        alt="Company"
                        className="object-contain rounded-full"
                        fill
                        sizes="48px"
                      />
                    </div>
                  </div>
                </div>
                {/* Content section */}
                <div className="px-5 flex flex-col items-start text-left">
                  <h3 className="font-bold text-xl mb-1">{formData.name}</h3>
                  <p className="text-sm mb-0.5">
                    {formData.jobTitle}
                  </p>
                  <p className="text-xs mb-0.5">
                    {formData.company}
                  </p>
                  <p className="text-xs">{formData.location}</p>

                  <div className="mt-3 w-full">
                    <p className="text-xs leading-relaxed">
                      {formData.bio}
                    </p>
                  </div>

                  {/* Contact button */}
                  <div className="flex gap-2 mt-5">

                    <button
                      className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdCall className="text-lg" />
                      <span className="text-xs">Call</span>
                    </button>

                    <button
                      className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdSave className="text-lg" />
                      <span className="text-xs">Save</span>
                    </button>

                    <button
                      className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor:
                          selectedLinkColor === "transparent"
                            ? "#3B82F6"
                            : selectedLinkColor,
                      }}
                    >
                      <MdEmail className="text-lg" />
                      <span className="text-xs">Mail</span>
                    </button>
                  </div>

                  {/* Social icons - horizontal layout for portrait mode */}
                  <div className="mt-6 w-full px-2 relative">
                    <div className="flex flex-wrap justify-center gap-4">
                      {linkOrder
                        .filter(
                          (key) => activeLinks[key as keyof typeof activeLinks]
                        )
                        .slice(0, 6) // Limit to 6 links for better display
                        .map((linkKey) => {
                          let iconComponent;
                          const linkName =
                            linkKey.charAt(0).toUpperCase() + linkKey.slice(1);

                          // Determine which icon to show based on link key
                          const linkImageKey = linkKey as keyof typeof linkImages;
                          if (linkImages[linkImageKey]) {
                            iconComponent = (
                              <div className="relative w-5 h-5">
                                <Image
                                  src={linkImages[linkImageKey]}
                                  alt={linkName}
                                  fill
                                  sizes="20px"
                                />
                              </div>
                            );
                          } else {
                            iconComponent = (
                              <LinkIcon className="h-4 w-4 text-white" />
                            );
                          }

                          return (
                            <div
                              key={linkKey}
                              className="flex flex-col items-center"
                            >
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-1"
                                style={{
                                  backgroundColor:
                                    selectedLinkColor === "transparent"
                                      ? "#3B82F6"
                                      : selectedLinkColor,
                                }}
                              >
                                {iconComponent}
                              </div>
                              <span className="text-[9px] font-medium text-center">
                                {linkName}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                    {/* Show more button if there are more than 6 links */}
                    {linkOrder.filter(
                      (key) => activeLinks[key as keyof typeof activeLinks]
                    ).length > 6 && (
                        <div className="mt-2 text-center">
                          <button className="text-[10px] text-blue-600 font-medium">
                            Show More
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          );
        }
      case "lead-capture-form":
        return (
          <LeadCaptureViewCard
            profileImage={profileImage}
            formHeader={formHeader}
            fields={leadCaptureFields}
            selectedCardTheme={selectedCardTheme}
            selectedFont={selectedFont}
            selectedLinkColor={selectedLinkColor}
            connectButtonText={connectButtonText}
            formDisclaimer={formDisclaimer}
            hiddenFields={hiddenFields}
          />
        );

      case "virtual-background":
        return (
          <div className="flex flex-col items-center h-full">
            <div className="text-xs flex flex-col space-y-5 text-center">
              <p className="text-[#828282] font-semibold">Virtual background preview</p>
            </div>
            <div className="w-full mt-4 rounded-xl overflow-hidden shadow-sm relative virtual-background-preview">
              <div className="relative">
                <Image
                  src={selectedVirtualBackground || `/virtualBackground/1.jpeg`}
                  alt="Selected virtual background preview"
                  className="w-full object-cover"
                  width={400}
                  height={225}
                />

                {/* Member info overlay at top left */}
                {showName && (
                  <div className={`absolute ${condensedView ? 'top-10 left-10' : 'top-4 left-4'} bg-white/80 backdrop-blur-sm rounded-md px-2 py-1 ${condensedView ? 'text-xs' : 'text-sm'}`}>
                    <p className="font-medium"> {member.name}</p>
                    {showJobTitle && (
                      <p className="text-xs text-gray-700">{member.jobTitle || data?.data?.template?.jobTitle}</p>
                    )}
                    {showCompany && (
                      <p className="text-xs text-gray-700">{member.company || data?.data?.template?.company}</p>
                    )}
                    {showLocation && (
                      <p className="text-xs text-gray-700">{member.location}</p>
                    )}
                  </div>
                )}

                {/* QR Code overlay at top right */}
                {showQrCode && (
                  <div className={`absolute flex items-center justify-center flex-col ${condensedView ? 'top-10 right-10' : 'top-4 right-4'} bg-white rounded-lg p-0.5`}>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        backgroundImage: `url(/uploads/681e83d42f89feb0060ba405/qrCodes/ddc0c101-db45-4f01-8dc6-eba5b303048a.png)`,
                        backgroundSize: 'cover',
                        filter: selectedQrColor !== "black" ? ` sepia(1) saturate(3) hue-rotate(${getHueRotateValue(selectedQrColor)})` : 'none'
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full mt-6 flex flex-col gap-3">

            </div>
          </div>
        );

      default:
        return (
          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="text-sm font-medium mb-2">Help & Resources</h3>
            <p className="text-xs text-muted-foreground">
              Select options on the left to view customization and configuration
              options.
            </p>{" "}
          </div>
        );
    }
  };

  // State to control visibility of recommended links section
  const [showRecommendedLinks, setShowRecommendedLinks] = useState(true);

  // Function to add a recommended link
  const handleAddRecommendedLink = (linkType: string) => {
    setCurrentEditingLink(linkType);
    setLinkUsername("");
    setLinkTitle(linkType.charAt(0).toUpperCase() + linkType.slice(1));
    setLinkUrl("");
    setIsLinkDialogOpen(true);
  };
  if (isPending) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <ThemePageSkeleton />
      </div>
    );
  }
  if (isError) {
    return <div>Error</div>;
  }
  return (
    <div className="w-full h-screen flex flex-col">
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
      <div className="p-3 flex-1 overflow-hidden">
        <div className="h-full w-full max-w-7xl mx-auto flex flex-col">
          {/* Header section with reduced height */}
          <div className="h-[60px] mb-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                asChild
              >
                <Link href="/themes">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>{" "}
              <div className="h-12 w-12 relative">
                <Image
                  src={member.profilePicture || "/defaultpp.png"}
                  alt="Profile Picture"
                  className="rounded-full object-cover border"
                  fill
                  sizes="(max-width: 768px) 100vw, 48px"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold leading-tight">
                  {member.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {member.username}
                </p>
              </div>
            </div>

            <Popover>
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
                    <span>Edit Profile</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Change Status</span>
                  </Button>
                  <Separator className="my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Deactivate Member</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {/* Card that fills the remaining space with a small bottom margin */}
          <Card className="w-full border overflow-hidden flex-1 mb-1">
            <div className="flex flex-col md:flex-row h-full">
              {" "}
              {/* Sidebar - 1/6 width */}
              <div className="w-full md:w-1/6 border-r h-full">
                <div className="p-2 pt-3">
                  <div className="space-y-4">
                    {/* Content Category */}
                    <div>
                      <h3 className="text-[10px] font-semibold uppercase text-muted-foreground ml-2.5 mb-1.5">
                        Content
                      </h3>
                      <nav className="space-y-1">
                        {navItems
                          .filter((item) =>
                            ["about", "links"].includes(item.value)
                          )
                          .map((item) => {
                            const isActive = activeTab === item.value;
                            return (
                              <button
                                key={item.value}
                                onClick={() => setActiveTab(item.value)}
                                className={cn(
                                  "flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                                  isActive
                                    ? "bg-black text-white"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                <item.icon className="h-3.5 w-3.5" />
                                <span className="tracking-tight">
                                  {item.name}{" "}
                                </span>
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

                    {/* Lead Management Category */}
                    <div>
                      <h3 className="text-[10px] font-semibold uppercase text-muted-foreground ml-2.5 mb-1.5">
                        Lead Management
                      </h3>
                      <nav className="space-y-1">
                        {navItems
                          .filter((item) =>
                            ["lead-capture-form", "follow-up-email"].includes(
                              item.value
                            )
                          )
                          .map((item) => {
                            const isActive = activeTab === item.value;
                            return (
                              <button
                                key={item.value}
                                onClick={() => setActiveTab(item.value)}
                                className={cn(
                                  "flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                                  isActive
                                    ? "bg-black text-white"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                <item.icon className="h-3.5 w-3.5" />
                                <span className="tracking-tight">
                                  {item.name}
                                </span>
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

                    {/* Sharing Category */}
                    <div>
                      <h3 className="text-[10px] font-semibold uppercase text-muted-foreground ml-2.5 mb-1.5">
                        
                      </h3>
                      <nav className="space-y-1">
                        {navItems
                          .filter((item) =>
                            [
                              "qr-code",
                              "virtual-background",
                              "email-signature",
                              "accessories",
                            ].includes(item.value)
                          )
                          .map((item) => {
                            const isActive = activeTab === item.value;
                            return (
                              <button
                                key={item.value}
                                onClick={() => setActiveTab(item.value)}
                                className={cn(
                                  "flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                                  isActive
                                    ? "bg-black text-white"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                <item.icon className="h-3.5 w-3.5" />
                                <span className="tracking-tight">
                                  {item.name}
                                </span>
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
                </div>

              </div>{" "}
              {/* Content - 3/6 width */}
              <div className="w-full md:w-3/6 p-6 h-full">
                <ScrollArea className="h-full modern-scrollbar">
                  {renderContent()}
                </ScrollArea>
              </div>
              {/* Right panel - 2/6 width */}
              <div className="w-full md:w-2/6 border-l p-6 h-full">
                <ScrollArea className="h-full modern-scrollbar">
                  {renderRightPanel()}
                </ScrollArea>
              </div>
            </div>{" "}
          </Card>
          {/* Image Cropping Dialog */}{" "}
          <CropImageDialog
            isOpen={isCropperOpen}
            onClose={handleCloseDialog}
            imageSrc={tempImageSrc}
            originalFile={tempImageFile}
            onCropComplete={handleCropComplete}
            aspectRatio={cropType === "cover" ? 3 : 1}
            cropType={cropType}
            roundedCrop={cropType === "profile" || cropType === "logo"}
          />
          {/* Links Category Modal */}
          <LinksCategoryModal
            isOpen={isLinksModalOpen}
            onClose={() => setIsLinksModalOpen(false)}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            linkImages={linkImages}
            onLinkSelect={(link) => {
              setCurrentEditingLink(link);
              setLinkUsername("");
              setLinkTitle(link.charAt(0).toUpperCase() + link.slice(1));
              setLinkUrl("");
              setIsLinksModalOpen(false);
              setIsLinkDialogOpen(true);
            }}
          />
          {/* Link Editing Dialog */}
          <LinkEditingDialog
            isOpen={isLinkDialogOpen}
            onClose={() => setIsLinkDialogOpen(false)}
            onBack={() => {
              setIsLinkDialogOpen(false);
              setIsLinksModalOpen(true);
            }}
            currentEditingLink={currentEditingLink}
            linkImages={linkImages}
            linkUsername={linkUsername}
            setLinkUsername={setLinkUsername}
            linkTitle={linkTitle}
            setLinkTitle={setLinkTitle}
            member={member}
            onSave={() => {
              console.log("Saving link:", {
                type: currentEditingLink,
                username: linkUsername,
                title: linkTitle,
                url: linkUrl,
              });

              // Only proceed if we have both link type and username
              if (currentEditingLink && linkUsername) {
                const linkData = {
                  type: currentEditingLink,
                  username: linkUsername,
                  title:
                    linkTitle ||
                    currentEditingLink.charAt(0).toUpperCase() +
                    currentEditingLink.slice(1),
                  url: linkUrl,
                };

                // Add or update the link in userLinks
                setUserLinks({
                  ...userLinks,
                  [currentEditingLink]: linkData,
                });

                // Set the link to active
                setActiveLinks({
                  ...activeLinks,
                  [currentEditingLink]: true,
                });

                // Add the link to linkOrder if it's not already there
                if (!linkOrder.includes(currentEditingLink)) {
                  setLinkOrder([...linkOrder, currentEditingLink]);
                }

                console.log("Adding/updating link:", {
                  linkOrder: [...linkOrder, currentEditingLink],
                  activeLinks: { ...activeLinks, [currentEditingLink]: true },
                  userLinks: { ...userLinks, [currentEditingLink]: linkData },
                });
              }

              setIsLinkDialogOpen(false);
            }}
          />
          {/* Template Selection Dialog */}
          <TemplateSelectionDialog
            open={isTemplateDialogOpen}
            onOpenChange={setIsTemplateDialogOpen}
            currentTemplateId={currentTemplateId}
            onTemplateSelect={(templateId) => {
              setCurrentTemplateId(templateId);
              console.log("Selected template:", templateId);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MemberDetailPage;
