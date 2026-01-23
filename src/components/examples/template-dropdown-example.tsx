"use client";

import React, { useState } from "react";
import { SearchableDropdown, DropdownItem } from "@/components/ui/searchable-dropdown";

export function TemplateDropdownExample() {
  const [availableTemplates, setAvailableTemplates] = useState<DropdownItem[]>([
    {
      id: "1",
      name: "Business Card Template",
      description: "Professional business card layout with company branding",
      avatar: "/uploads/template-business.jpg"
    },
    {
      id: "2", 
      name: "Social Media Profile",
      description: "Modern social media profile template with links",
      avatar: "/uploads/template-social.jpg"
    },
    {
      id: "3",
      name: "Contact Card Template", 
      description: "Simple contact information card template",
      avatar: "/uploads/template-contact.jpg"
    },
    {
      id: "4",
      name: "Portfolio Template",
      description: "Creative portfolio template for showcasing work",
      avatar: "/uploads/template-portfolio.jpg"
    },
    {
      id: "5",
      name: "Event Template",
      description: "Event information and registration template",
      avatar: "/uploads/template-event.jpg"
    }
  ]);

  const handleTemplateSelect = (template: DropdownItem) => {
    console.log("Selected template:", template);
    // Add your template selection logic here
    // For example: applyTemplate(template.id);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Template Selection Example</h3>
      <SearchableDropdown
        items={availableTemplates}
        buttonText="Choose a Template"
        buttonVariant="default"
        buttonClassName="px-6 py-2"
        placeholder="Search templates..."
        onItemSelect={handleTemplateSelect}
        emptyMessage="No templates found"
        width="400px"
      />
    </div>
  );
}
