"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Api } from "@/lib/api";
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Youtube, 
  Upload, 
  Trash2, 
  Info, 
  Plus,
  GripVertical,
  X,
  Globe
} from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailSignatureFormProps {
  signatureId: string;
  initialSignature?: EmailSignatureDocument | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface EmailSignatureDocument {
  _id: string;
  signatureName: string;
  information?: {
    name?: boolean;
    pronouns?: boolean;
    jobtitle?: boolean;
    companyname?: boolean;
    location?: boolean;
    email?: boolean;
    phoneNumber?: boolean;
  };
  images?: {
    profilepic?: boolean;
    companylogo?: boolean;
    qrcode?: boolean;
    showBanner?: boolean;
    banner?: string;
  };
  disclaimer?: string;
  users?: Array<{ _id: string; name: string; email: string; profileImage?: string }>;
}

interface FormState {
  name: string;
  showName: boolean;
  showPronouns: boolean;
  showJobTitle: boolean;
  showCompanyName: boolean;
  showLocation: boolean;
  showEmail: boolean;
  showPhoneNumber: boolean;
  showProfilePic: boolean;
  showCompanyLogo: boolean;
  showQRCode: boolean;
  showBanner: boolean;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  phoneNumber?: string;
  email?: string;
  pronouns?: string;
  profilePic?: string;
  companyLogo?: string;
  bannerImage?: string;
  bannerImageFile?: File;  // Adding new field for File object
  links: any[];
  colorIcons: boolean;
  disclaimer?: string;
  theme: string;
}

const defaultFormState: FormState = {
  name: "",
  showName: true,
  showPronouns: false,
  showJobTitle: true,
  showCompanyName: true,
  showLocation: true,
  showEmail: true,
  showPhoneNumber: true,
  showProfilePic: true,
  showCompanyLogo: true,
  showQRCode: false,
  showBanner: true,
  jobTitle: "Job Title",
  companyName: "Company Name",
  location: "Location",
  phoneNumber: "+1 000 000 0000",
  email: "email@example.com",
  pronouns: "",
  profilePic: "",
  companyLogo: "",
  bannerImage: "/emailSignatureBgTemp1.png",
  links: [],
  colorIcons: true,
  disclaimer: "",
  theme: "theme1",
};

function mapSignatureToFormState(
  signatureData: EmailSignatureDocument,
  previous: FormState = defaultFormState,
): FormState {
  const assignedMember = signatureData.users?.[0];

  return {
    ...previous,
    name: signatureData.signatureName || "",
    showName: signatureData.information?.name ?? true,
    showPronouns: signatureData.information?.pronouns ?? false,
    showJobTitle: signatureData.information?.jobtitle ?? true,
    showCompanyName: signatureData.information?.companyname ?? true,
    showLocation: signatureData.information?.location ?? true,
    showEmail: signatureData.information?.email ?? true,
    showPhoneNumber: signatureData.information?.phoneNumber ?? true,
    showProfilePic: signatureData.images?.profilepic ?? true,
    showCompanyLogo: signatureData.images?.companylogo ?? true,
    showQRCode: signatureData.images?.qrcode ?? false,
    showBanner:
      signatureData.images?.showBanner ??
      Boolean(signatureData.images?.banner),
    bannerImage:
      signatureData.images?.banner || previous.bannerImage,
    disclaimer: signatureData.disclaimer || "",
    profilePic: assignedMember?.profileImage || previous.profilePic,
    email: assignedMember?.email || previous.email,
  };
}

export function EmailSignatureForm({
  signatureId,
  initialSignature,
  onSuccess,
  onCancel,
}: EmailSignatureFormProps) {
  const [formState, setFormState] = useState<FormState>(() =>
    initialSignature
      ? mapSignatureToFormState(initialSignature, defaultFormState)
      : defaultFormState,
  );
  const [isLoadingSignature, setIsLoadingSignature] = useState(!initialSignature);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSocialType, setSelectedSocialType] = useState<string>("instagram");
  const [linkUrl, setLinkUrl] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (initialSignature || !signatureId) {
      return;
    }

    let isCancelled = false;

    const fetchEmailSignature = async () => {
      try {
        setIsLoadingSignature(true);
        const response = await Api.get(`/email-signature/${signatureId}`);

        if (!isCancelled) {
          setFormState((prev) =>
            mapSignatureToFormState(response.data.signature, prev),
          );
        }
      } catch (error) {
        console.error("Error fetching email signature:", error);
        if (!isCancelled) {
          toast({
            title: "Error",
            description: "Failed to load email signature.",
          });
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingSignature(false);
        }
      }
    };

    fetchEmailSignature();

    return () => {
      isCancelled = true;
    };
  }, [signatureId, initialSignature]);

  // File upload handling
  const handleFileUpload = async (fileType: "profilePic" | "companyLogo" | "bannerImage", e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file" });
      return;
    }
    
    // Max file size: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 5MB" });
      return;
    }

    const url = URL.createObjectURL(file);
    
    if (fileType === "bannerImage") {
      setFormState(prev => ({
        ...prev,
        bannerImage: url,
        bannerImageFile: file
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        [fileType]: url
      }));
    }
  };
  
  const removeImage = (imageType: "profilePic" | "companyLogo" | "bannerImage") => {
    handleFormChange(imageType, "");
  };

  const handleFormChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleChange = (field: keyof FormState) => {
    setFormState(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  

  

  // Update the preview whenever form state changes
  useEffect(() => {
    const previewContainer = document.getElementById('signature-preview');
    if (previewContainer) {
      // Create clone of the signature HTML for preview
      previewContainer.innerHTML = generateSignatureHTML(formState);
    }
  }, [formState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.name.trim()) {
      toast({ title: "Error", description: "Signature name is required" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Only include specific fields we want to send
      const fieldsToInclude = {
        name: formState.name,
        showName: formState.showName,
        showPronouns: formState.showPronouns,
        showJobTitle: formState.showJobTitle,
        showCompanyName: formState.showCompanyName,
        showLocation: formState.showLocation,
        showEmail: formState.showEmail,
        showPhoneNumber: formState.showPhoneNumber,
        showProfilePic: formState.showProfilePic,
        showCompanyLogo: formState.showCompanyLogo,
        showQRCode: formState.showQRCode,
        showBanner: formState.showBanner,
        disclaimer: formState.disclaimer,
      };

      // Add selected fields to FormData
      Object.entries(fieldsToInclude).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value);
          }
        }
      });

      // Handle bannerImage separately if it's a File
      if (formState.bannerImageFile) {
        formData.append('bannerImage', formState.bannerImageFile);
      }

      if (signatureId) {
        await Api.patch(`/email-signature/${signatureId}/update`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast({
          title: "Success",
          description: "Email signature updated successfully",
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving signature:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save email signature. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate HTML for the email signature based on form state
  const generateSignatureHTML = (state: FormState): string => {
   

    return `
    <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; color: #333333; width: 100%; max-width: 600px;">
      <tr>
        <td>
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <!-- Left section with profile and info centered -->
              <td style="vertical-align: top; text-align: center; padding-right: 20px; width: 70%;">
                <!-- Profile Picture with company logo badge -->
                ${state.showProfilePic ? `
                <div style="position: relative; display: inline-block; margin-bottom: 15px;">
                  <img src="${state.profilePic || window.location.origin + '/defaultpp.png'}" 
                    alt="Profile Picture" width="120" height="120" style="border-radius: 50%; object-fit: cover;" />
                  ${state.showCompanyLogo ? `
                  <div style="position: absolute; top: -8px; right: -8px; width: 40px; height: 40px; background: white; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                    <img src="${state.companyLogo || window.location.origin + '/babel.png'}" 
                      alt="Company Logo" width="40" height="40" style="border-radius: 50%; object-fit: cover;" />
                  </div>
                  ` : ''}
                </div>
                ` : ''}
                
                <!-- Information below profile -->
                ${state.showName ? `<p style="font-weight: 600; font-size: 18px; margin: 0 0 5px 0;">${state.name}</p>` : ''}
                ${state.showPronouns && state.pronouns ? `<p style="font-size: 14px; color: #777777; margin: 0 0 5px 0;">(${state.pronouns})</p>` : ''}
                ${state.showJobTitle && state.jobTitle ? `<p style="font-size: 14px; margin: 0 0 5px 0;">${state.jobTitle}</p>` : ''}
                ${state.showCompanyName && state.companyName ? `<p style="font-weight: 600; margin: 0 0 10px 0;">${state.companyName}</p>` : ''}
                
                <!-- Contact info -->
                <div style="margin-top: 10px;">
                  ${state.showEmail && state.email ? `<p style="font-size: 14px; color: #0066cc; margin: 0 0 3px 0;">${state.email}</p>` : ''}
                  ${state.showPhoneNumber && state.phoneNumber ? `<p style="font-size: 14px; margin: 0 0 3px 0;">${state.phoneNumber}</p>` : ''}
                  ${state.showLocation && state.location ? `<p style="font-size: 14px; color: #777777; margin: 0 0 3px 0;">${state.location}</p>` : ''}
                </div>
                
                ${state.links.length > 0 ? `
                <div style="margin-top: 15px;">
                </div>
                ` : ''}
              </td>
              
              <!-- Right section with QR code centered -->
              <td style="vertical-align: middle; text-align: center; width: 30%;">
                ${state.showQRCode ? `
                <div style="display: inline-block;">
                  <div style="width: 120px; height: 120px; background-color: #f5f5f5; border: 1px solid #eeeeee; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px auto;">
                    QR Code
                  </div>
                  <p style="margin: 0; font-size: 12px; color: #0066cc;">My Digital Business Card</p>
                </div>
                ` : ''}
              </td>
            </tr>
          </table>
          
          ${state.showBanner ? `
          <div style="margin-top: 15px;">
            <img src="${state.bannerImage || window.location.origin + '/emailSignatureBgTemp1.png'}" 
              alt="Banner" width="100%" style="max-height: 120px; object-fit: cover; border-radius: 4px;" />
          </div>
          ` : ''}
          
          ${state.disclaimer ? `
          <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eeeeee;">
            <p style="font-size: 11px; color: #999999; margin: 0;">${state.disclaimer}</p>
          </div>
          ` : ''}
        </td>
      </tr>
    </table>
    `;
  };

  // Update the preview in the fixed container
  useEffect(() => {
    const previewContainer = document.getElementById('signature-preview-container');
    if (previewContainer) {
      previewContainer.innerHTML = '';
      
      // Create the preview wrapper
      const previewWrapper = document.createElement('div');
      previewWrapper.className = 'max-w-[600px] mx-auto';
      
      // Create signature preview header
      const previewHeader = document.createElement('div');
      previewHeader.className = 'text-center text-gray-600 mb-4';
      previewHeader.textContent = 'Signature Preview';
      previewWrapper.appendChild(previewHeader);
      
      // Create signature card container
      const signatureCard = document.createElement('div');
      signatureCard.className = 'bg-white rounded-xl shadow-sm p-6 border border-gray-100';
      
      // Create main content wrapper - now with flex-col layout
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'flex';
      
      // Left section - Profile and information in column layout
      const leftSection = document.createElement('div');
      leftSection.className = 'flex flex-col items-center flex-1';
      
      // Profile Picture
      if (formState.showProfilePic) {
        const profilePicContainer = document.createElement('div');
        profilePicContainer.className = 'relative flex justify-center mb-4';
        
        const profilePicDiv = document.createElement('div');
        profilePicDiv.className = 'w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex-shrink-0';
        
        if (formState.profilePic) {
          const img = document.createElement('img');
          img.src = formState.profilePic;
          img.alt = "Profile";
          img.className = 'w-full h-full object-cover';
          profilePicDiv.appendChild(img);
        } else {
          const placeholder = document.createElement('div');
          placeholder.className = 'w-full h-full flex items-center justify-center text-gray-400';
          placeholder.textContent = 'Photo';
          profilePicDiv.appendChild(placeholder);
        }
        
        // Company logo badge
        if (formState.showCompanyLogo) {
          const companyBadge = document.createElement('div');
          companyBadge.className = 'absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full overflow-hidden border-3 border-white shadow-lg';
          
          const companyLogo = document.createElement('img');
          companyLogo.src = formState.companyLogo || '/babel.png';
          companyLogo.alt = "Company";
          companyLogo.className = 'w-full h-full object-cover';
          
          companyBadge.appendChild(companyLogo);
          profilePicContainer.appendChild(profilePicDiv);
          profilePicContainer.appendChild(companyBadge);
        } else {
          profilePicContainer.appendChild(profilePicDiv);
        }
        
        leftSection.appendChild(profilePicContainer);
      }
      
      // Content section - Information below profile image
      const contentDiv = document.createElement('div');
      contentDiv.className = 'text-center';
      
      // Name
      if (formState.showName) {
        const name = document.createElement('h3');
        name.className = 'font-semibold text-lg mb-1';
        name.textContent = formState.name || "Full Name";
        contentDiv.appendChild(name);
      }
      
      // Pronouns
      if (formState.showPronouns && formState.pronouns) {
        const pronouns = document.createElement('p');
        pronouns.className = 'text-sm text-gray-500 mb-1';
        pronouns.textContent = `(${formState.pronouns})`;
        contentDiv.appendChild(pronouns);
      }
      
      // Job Title
      if (formState.showJobTitle && formState.jobTitle) {
        const jobTitle = document.createElement('p');
        jobTitle.className = 'text-sm mb-1';
        jobTitle.textContent = formState.jobTitle;
        contentDiv.appendChild(jobTitle);
      }
      
      // Company Name
      if (formState.showCompanyName && formState.companyName) {
        const companyName = document.createElement('p');
        companyName.className = 'font-semibold mb-1';
        companyName.textContent = formState.companyName;
        contentDiv.appendChild(companyName);
      }
      
      // Contact info container
      const contactInfo = document.createElement('div');
      contactInfo.className = 'mt-2 space-y-1';
      
      // Email
      if (formState.showEmail && formState.email) {
        const email = document.createElement('p');
        email.className = 'text-sm text-blue-600';
        email.textContent = formState.email;
        contactInfo.appendChild(email);
      }
      
      // Phone
      if (formState.showPhoneNumber && formState.phoneNumber) {
        const phone = document.createElement('p');
        phone.className = 'text-sm';
        phone.textContent = formState.phoneNumber;
        contactInfo.appendChild(phone);
      }
      
      // Location
      if (formState.showLocation && formState.location) {
        const location = document.createElement('p');
        location.className = 'text-sm text-gray-500 mt-1';
        location.textContent = formState.location;
        contactInfo.appendChild(location);
      }
      
      contentDiv.appendChild(contactInfo);
      leftSection.appendChild(contentDiv);
      
      // Right section - QR code centered
      const rightSection = document.createElement('div');
      rightSection.className = 'flex flex-col items-center justify-center flex-shrink-0 ml-8';
      
      // QR Code
      if (formState.showQRCode) {
        const qrContainer = document.createElement('div');
        qrContainer.className = 'w-24 h-24 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center mb-2';
        qrContainer.textContent = 'QR Code';
        rightSection.appendChild(qrContainer);
        
        // Digital card text below QR code
        const digitalCardText = document.createElement('p');
        digitalCardText.className = 'text-xs text-blue-600 text-center';
        digitalCardText.textContent = 'My Digital Business Card';
        rightSection.appendChild(digitalCardText);
      }
      
      // Assemble all parts
      contentWrapper.appendChild(leftSection);
      contentWrapper.appendChild(rightSection);
      signatureCard.appendChild(contentWrapper);
      
      // Banner image
      if (formState.showBanner) {
        const bannerContainer = document.createElement('div');
        bannerContainer.className = 'mt-4';
        
        const banner = document.createElement('img');
        banner.src = formState.bannerImage || '/emailSignatureBgTemp1.png';
        banner.alt = "Banner";
        banner.className = 'w-full h-auto max-h-32 object-cover rounded-md';
        
        bannerContainer.appendChild(banner);
        signatureCard.appendChild(bannerContainer);
      }
      
      // Disclaimer
      if (formState.disclaimer) {
        const disclaimerContainer = document.createElement('div');
        disclaimerContainer.className = 'mt-4 pt-4 border-t border-gray-100';
        
        const disclaimerText = document.createElement('p');
        disclaimerText.className = 'text-xs text-gray-500';
        disclaimerText.textContent = formState.disclaimer;
        
        disclaimerContainer.appendChild(disclaimerText);
        signatureCard.appendChild(disclaimerContainer);
      }
      
      // Append final assembled preview
      previewWrapper.appendChild(signatureCard);
      previewContainer.appendChild(previewWrapper);
    }
  }, [formState]);

  if (isLoadingSignature) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-muted-foreground">
        Loading signature settings...
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-50 flex gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-lg shadow-md">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          Save
        </Button>
      </div>

      <div className="space-y-8">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
              <Label htmlFor="name" className="block mb-3 font-semibold text-slate-700">Signature Name *</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="Enter signature name"
                className="w-full p-4 rounded-xl bg-slate-50/50 border-slate-200/60 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                required
              />
            </div>

           
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
              <div className="flex items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Information Settings</h3>
                <div className="ml-3 rounded-full w-6 h-6 bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <Info size={14} className="text-blue-600" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/40 hover:shadow-sm transition-all duration-200">
                  <span className="font-medium text-slate-700">Name</span>
                  <Switch 
                    checked={formState.showName} 
                    onCheckedChange={() => handleToggleChange("showName")} 
                  />
                </div>
                
                
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span>Pronouns</span>
                  <Switch 
                    checked={formState.showPronouns} 
                    onCheckedChange={() => handleToggleChange("showPronouns")} 
                  />
                </div>
                
                
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span>Job Title</span>
                  <Switch 
                    checked={formState.showJobTitle} 
                    onCheckedChange={() => handleToggleChange("showJobTitle")} 
                  />
                </div>
                
                
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span>Company Name</span>
                  <Switch 
                    checked={formState.showCompanyName} 
                    onCheckedChange={() => handleToggleChange("showCompanyName")} 
                  />
                </div>
                
                
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span>Location</span>
                  <Switch 
                    checked={formState.showLocation} 
                    onCheckedChange={() => handleToggleChange("showLocation")} 
                  />
                </div>
                
                              
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span>Phone Number</span>
                  <Switch 
                    checked={formState.showPhoneNumber} 
                    onCheckedChange={() => handleToggleChange("showPhoneNumber")} 
                  />
                </div>
                
                
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <h3 className="text-base font-medium">Images</h3>
                <div className="ml-2 rounded-full w-5 h-5 border border-gray-300 flex items-center justify-center text-xs">
                  <Info size={12} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center col-span-2 justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="block">Profile Pic</span>
                    <span className="text-xs text-gray-500 mt-1 block">Members profile photo will be displayed in their signature</span>
                  </div>
                  <Switch 
                    checked={formState.showProfilePic} 
                    onCheckedChange={() => handleToggleChange("showProfilePic")} 
                  />
                </div>
                
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="block">Company Logo</span>
                    <span className="text-xs text-gray-500 mt-1 block">Company logo will be displayed in the signature</span>
                  </div>
                  <Switch 
                    checked={formState.showCompanyLogo} 
                    onCheckedChange={() => handleToggleChange("showCompanyLogo")} 
                  />
                </div>
                
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="block">QR Code</span>
                    <span className="text-xs text-gray-500 mt-1 block">QR code to members digital card will be displayed</span>
                  </div>
                  <Switch 
                    checked={formState.showQRCode} 
                    onCheckedChange={() => handleToggleChange("showQRCode")} 
                  />
                </div>
                
                <div className="flex items-center col-span-2 justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-2">Banner</span>
                    <div className="rounded-full w-5 h-5 border border-gray-300 flex items-center justify-center text-xs">
                      <Info size={12} />
                    </div>
                  </div>
                  <Switch 
                    checked={formState.showBanner} 
                    onCheckedChange={() => handleToggleChange("showBanner")} 
                  />
                </div>
                
                {formState.showBanner && (
                  <div className="ml-4 pl-4 border-l-4 border-gray-300 p-4 bg-gray-50 rounded">
                    <div className="border border-gray-200 rounded-md overflow-hidden mb-2">
                      <Image 
                        src={formState.bannerImage || "/emailSignatureBgTemp1.png"}
                        alt="Banner preview"
                        width={400}
                        height={120}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    
                    <div className="flex mt-2">
                      <div className="relative">
                        <input 
                          type="file" 
                          id="bannerImage-upload"
                          onChange={(e) => handleFileUpload('bannerImage', e)} 
                          className="sr-only"
                          accept="image/*"
                        />
                        <label htmlFor="bannerImage-upload">
                          <Button variant="outline" size="sm" className="mr-2" asChild>
                            <span>
                              <Upload size={14} className="mr-1" />
                              Upload
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                  
               
                
                
              </div>
              
              
              
            </div>
            
            <div>
              <h3 className="text-base font-medium mb-4">Disclaimer</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Input
                  value={formState.disclaimer || ""}
                  onChange={(e) => handleFormChange("disclaimer", e.target.value)}
                  className="w-full shadow-none border-none min-h-[100px]"
                  placeholder="Add a disclaimer"
                />
              </div>
            </div>
          </div>
          
          {/* Hidden submit button that will be triggered by the button in the fixed area */}
        </form>
      </div>
    </div>
  );
}
