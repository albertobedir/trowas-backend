"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LeadCaptureViewCardProps {
  profileImage: string;
  formHeader: string;
  fields: {
    id: number;
    name: string;
    required: boolean;
    type: 'text' | 'dropdown' | 'checkbox' | 'file';
    options?: string[]; // For dropdown type
  }[];
  selectedCardTheme: string;
  selectedFont: string;
  selectedLinkColor: string;
  connectButtonText?: string; // Add connect button text prop
  formDisclaimer?: string; // Add form disclaimer text prop
  hiddenFields?: {
    id: number;
    title: string;
    value: string;
  }[]; // Add hidden fields prop
  cardUrl?: string; // Add card URL prop
}

export default function LeadCaptureViewCard({
  profileImage,
  formHeader,
  fields,
  selectedCardTheme = "#FF6DB0", // Pink default from screenshot
  selectedFont = "Inter",
  selectedLinkColor = "#F5A623", // Orange default from screenshot
  connectButtonText = "Connect", // Default connect button text
  formDisclaimer = "Your data is private and secure", // Default form disclaimer text
  hiddenFields = [], // Default empty array for hidden fields
  cardUrl = ""
}: LeadCaptureViewCardProps) {
  // Track which dropdown is currently open
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  
  // Toggle dropdown
  const toggleDropdown = (id: number) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(id);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs flex flex-col space-y-5 text-center mb-4">
        <p className="text-[#828282] font-semibold">Lead capture mode preview</p>
        {cardUrl ? (
          <Link className="text-[#29AEF8] font-medium" href={cardUrl} target="_blank">View card</Link>
        ) : (
          <p className="text-[#29AEF8] font-medium cursor-pointer">View card</p>
        )}
      </div>
      
      {/* Preview container - matching the design from the screenshot */}
      <div 
        className="w-64 rounded-[25px] overflow-hidden bg-white mb-4"
        style={{ fontFamily: selectedFont }}
      >
        {/* Pink header area */}
        <div 
          className="h-28 w-full flex justify-center relative"
          style={{ 
            backgroundColor: selectedCardTheme === "transparent" ? "#FF6DB0" : selectedCardTheme
          }}
        >
          {/* This area is empty except for the avatar which sits on the border */}
        </div>

        {/* White content area */}
        <div className="bg-white rounded-xl p-4 mx-0 -mt-14 mb-4 relative">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md absolute -top-8 left-1/2 transform -translate-x-1/2">
              <Image 
                src={profileImage} 
                alt="Profile"
                className="object-cover w-full h-full"
                width={64}
                height={64}
              />
            </div>
          </div>
          
          <div className="mt-8">            <h3 className="text-center font-semibold text-base mb-3 px-2">
              {formHeader}
            </h3>
            
            <div className="space-y-2 mb-4 max-h-64">
              <ScrollArea className="h-full max-h-64">
                <div className="space-y-2 pr-2">
                  {fields.map(field => (
                    <div key={field.id}>
                      {renderPreviewField(field, toggleDropdown, openDropdownId)}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
              <button 
              className="w-full py-2 rounded-full text-sm font-medium text-white"
              style={{ 
                backgroundColor: selectedLinkColor === "transparent" ? "#F5A623" : selectedLinkColor 
              }}
            >
              {connectButtonText}
            </button>
            
            <p className="text-[10px] text-center text-gray-400 mt-3">
              {formDisclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Helper function to render preview fields
  function renderPreviewField(
    field: {
      id: number;
      name: string;
      required: boolean;
      type: 'text' | 'dropdown' | 'checkbox' | 'file';
      options?: string[];
    },
    toggleDropdown: (id: number) => void,
    openDropdownId: number | null
  ) {
    switch (field.type) {
      case 'text':
        return (
          <div className="bg-[#f7f7f7] rounded-md p-2 relative">
            <p className="text-xs text-gray-500">{field.name || "Field name"}</p>
            {field.required && (
              <span className="absolute top-1 right-1 text-red-500 text-xs">*</span>
            )}
          </div>
        );
      case 'dropdown':
        return (
          <div className="relative">
            <div 
              className="bg-[#f7f7f7] rounded-md p-2 flex justify-between items-center relative cursor-pointer"
              onClick={() => toggleDropdown(field.id)}
            >
              <p className="text-xs text-gray-500">{field.name || "Dropdown field"}</p>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-gray-400">
                <path d="m6 9 6 6 6-6"/>
              </svg>
              {field.required && (
                <span className="absolute top-1 right-1 text-red-500 text-xs">*</span>
              )}
            </div>
            
            {openDropdownId === field.id && field.options && field.options.length > 0 && (
              <div className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-sm w-full mt-1 py-1">
                {field.options.map((option, index) => (
                  <div 
                    key={index} 
                    className="px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'checkbox':
        return (
          <div className="bg-[#f7f7f7] rounded-md p-2 flex justify-between items-center">
            <p className="text-xs text-gray-500">{field.name || "Checkbox field"}</p>
            <div className="h-3 w-3 border border-gray-400 rounded flex items-center justify-center">
              {/* Empty checkbox */}
            </div>
          </div>
        );
      case 'file':
        return (
          <div className="bg-[#f7f7f7] rounded-md p-2 flex justify-between items-center relative">
            <p className="text-xs text-gray-500">{field.name || "File upload"}</p>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-gray-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            {field.required && (
              <span className="absolute top-1 right-1 text-red-500 text-xs">*</span>
            )}
          </div>
        );
      default:
        return null;
    }
  }
}
