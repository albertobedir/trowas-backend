import React from 'react';
import { X, FileText } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import LiveTemplatePreview from "@/components/ui/live-template-preview";

interface TemplateSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: string;
  setCurrentTemplate: (template: string) => void;
  profileImage: string;
}

interface Template {
  id: string;
  name: string;
  logo: string;
  layout?: 'Center Aligned' | 'Left Aligned' | 'Portrait';
  cardTheme?: string;
  font?: string;
  linkColor?: string;
}

const templates: Template[] = [
  { id: "no-template", name: "No template", logo: "none" },
  { 
    id: "template-5-1", 
    name: "Template 5", 
    logo: "popl",
    layout: "Center Aligned",
    cardTheme: "#FFFFFF",
    font: "Inter",
    linkColor: "#3B82F6"
  },
  { 
    id: "template-5-2", 
    name: "Template 5 Pro", 
    logo: "popl",
    layout: "Left Aligned",
    cardTheme: "#F8FAFC",
    font: "Inter",
    linkColor: "#1E40AF"
  },
  { 
    id: "template-4", 
    name: "Template 4", 
    logo: "popl",
    layout: "Portrait",
    cardTheme: "#FEF3C7",
    font: "Inter",
    linkColor: "#D97706"
  },
  { 
    id: "template-3", 
    name: "Template 3", 
    logo: "popl",
    layout: "Center Aligned",
    cardTheme: "#DBEAFE",
    font: "Arial",
    linkColor: "#2563EB"
  },
  { 
    id: "babel", 
    name: "BABEL", 
    logo: "babel",
    layout: "Left Aligned",
    cardTheme: "#1F2937",
    font: "Inter",
    linkColor: "#F59E0B"
  },
  { 
    id: "admin", 
    name: "Admin Template", 
    logo: "popl",
    layout: "Portrait",
    cardTheme: "#F3F4F6",
    font: "Roboto",
    linkColor: "#059669"
  }
];

export default function TemplateSelectionDialog({ 
  isOpen, 
  onClose, 
  currentTemplate, 
  setCurrentTemplate,
  profileImage
}: TemplateSelectionDialogProps) {
  // Find the selected template configuration
  const selectedTemplate = templates.find(t => t.name === currentTemplate);
  
  // Mock profile data for preview - in a real app this would come from props or API
  const mockProfileData = {
    name: "John Doe",
    jobTitle: "Product Manager",
    company: "Tech Corp", 
    location: "San Francisco, CA",
    bio: "Passionate about creating innovative solutions that make a difference. Always learning and growing in the tech space."
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 gap-0">
        <div className="flex items-center justify-between p-4 border-b">
          <DialogTitle className="text-xl">Choose a Template</DialogTitle>
          <DialogClose className="rounded-full hover:bg-gray-100 p-1">
            <X className="h-5 w-5" />
          </DialogClose>
        </div>
        
        <div className="flex h-[600px]">
          {/* Left side - Template list */}
          <div className="w-2/5 border-r overflow-auto p-2">
            {/* No template option */}
            <div 
              className={`flex items-center p-3 mb-2 rounded-md hover:bg-gray-100 cursor-pointer ${
                currentTemplate === "No template" ? "bg-blue-50 border border-blue-200" : ""
              }`}
              onClick={() => setCurrentTemplate("No template")}
            >
              <div className="w-10 h-10 rounded-full border flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <span className="ml-3">No template</span>
            </div>
            
            {/* Template options */}
            {templates.slice(1).map((template) => (
              <div 
                key={template.id}
                className={`flex items-center p-3 mb-2 rounded-md hover:bg-gray-100 cursor-pointer ${
                  currentTemplate === template.name ? "bg-blue-50 border border-blue-200" : ""
                }`}
                onClick={() => setCurrentTemplate(template.name)}
              >
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center overflow-hidden">
                  <Image 
                    src={template.logo === 'babel' ? "/babel.png" : "/company_logo.png"} 
                    alt={template.name}
                    width={40}
                    height={40}
                  />
                </div>
                <div className="ml-3">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.layout}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right side - Live Template Preview */}
          <div className="w-3/5 p-4 bg-gray-50 flex flex-col items-center">
            {currentTemplate === "No template" ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Template Selected</h3>
                  <p className="text-gray-500">Select a template to see the live preview</p>
                </div>
              </div>
            ) : (
              <LiveTemplatePreview
                template={selectedTemplate}
                profileData={mockProfileData}
                profileImage={profileImage}
                companyLogo="/company_logo.png"
              />
            )}
          </div>
        </div>
        
        <div className="flex justify-between p-4 border-t">
          <button 
            className="text-red-500 font-medium text-sm"
            onClick={() => {
              setCurrentTemplate("No template");
              onClose();
            }}
          >
            Unassign template
          </button>
          
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 border rounded-md text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-black text-white rounded-md text-sm"
              onClick={() => {
                // Save the template assignment logic would go here
                onClose();
              }}
            >
              Assign to card
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
