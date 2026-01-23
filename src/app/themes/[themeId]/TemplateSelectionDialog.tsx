import React from 'react';
import { X, FileText } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

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
}

const templates: Template[] = [
  { id: "no-template", name: "No template", logo: "none" },
  { id: "template-5-1", name: "Template 5", logo: "popl" },
  { id: "template-5-2", name: "Template 5", logo: "popl" },
  { id: "template-4", name: "Template 4", logo: "popl" },
  { id: "template-3", name: "Template 3", logo: "popl" },
  { id: "babel", name: "BABEL", logo: "babel" },
  { id: "admin", name: "Admin Template", logo: "popl" }
];

export default function TemplateSelectionDialog({ 
  isOpen, 
  onClose, 
  currentTemplate, 
  setCurrentTemplate,
  profileImage
}: TemplateSelectionDialogProps) {
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
              className="flex items-center p-3 mb-2 rounded-md hover:bg-gray-100 cursor-pointer"
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
                className="flex items-center p-3 mb-2 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => setCurrentTemplate(template.name)}
              >
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center overflow-hidden">                  <Image 
                    src={template.logo === 'babel' ? "/babel.png" : "/company_logo.png"} 
                    alt={template.name}
                    width={40}
                    height={40}
                  />
                </div>
                <span className="ml-3">{template.name}</span>
              </div>
            ))}
          </div>
          
          {/* Right side - Card preview */}
          <div className="w-3/5 p-4 bg-gray-50 flex flex-col items-center">
            <h3 className="text-sm text-gray-500 mb-4">Previewing card with template</h3>
            <div className="w-72 h-[500px] rounded-3xl overflow-hidden bg-white shadow-lg">
              <div className="h-36 bg-slate-800 relative">
                {/* Header with logos */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-slate-900 flex items-center">
                  {Array.from({length: 8}).map((_, i) => (
                    <div key={i} className="h-2 w-8 flex items-center justify-center">
                      <Image 
                        src="/babel.png" 
                        alt="logo"
                        width={16}
                        height={16}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Profile image */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white overflow-hidden relative">
                    <Image 
                      src={profileImage || "/defaultpp.png"}
                      alt="Profile"
                      fill
                      style={{objectFit: 'cover'}}
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 -mr-2">
                    <div className="w-9 h-9 rounded-full bg-blue-400 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-bold">
                        <Image 
                          src="/babel.png" 
                          alt="logo"
                          width={20}
                          height={20}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content area */}
              <div className="pt-16 px-4 text-center">
                <h2 className="text-lg font-semibold mb-1">Copy of Faruk</h2>
                <p className="text-sm mb-2 text-gray-600">CEO</p>
                <p className="text-xs mb-4 font-medium uppercase text-gray-500">BURSA</p>
                
                {/* Save contact button */}
                <button className="w-full py-3 rounded-full bg-black text-white text-sm font-semibold mb-4">
                  Save Contact
                </button>
              </div>
            </div>
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
