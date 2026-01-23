"use client";

import React, { useState } from 'react';
import LiveTemplatePreview from '@/components/ui/live-template-preview';

const testTemplates = [
  {
    id: "template-1",
    name: "Center Aligned Template",
    layout: "Center Aligned" as const,
    cardTheme: "#FFFFFF",
    font: "Inter",
    linkColor: "#3B82F6"
  },
  {
    id: "template-2",
    name: "Left Aligned Template",
    layout: "Left Aligned" as const,
    cardTheme: "#F8FAFC",
    font: "Inter",
    linkColor: "#1E40AF"
  },
  {
    id: "template-3", 
    name: "Portrait Template",
    layout: "Portrait" as const,
    cardTheme: "#DBEAFE",
    font: "Inter",
    linkColor: "#2563EB"
  },
  {
    id: "template-4",
    name: "Dark Theme Template",
    layout: "Center Aligned" as const,
    cardTheme: "#1F2937",
    font: "Inter",
    linkColor: "#F59E0B"
  }
];

const mockProfileData = {
  name: "John Doe",
  jobTitle: "Product Manager",
  company: "Tech Corp",
  location: "San Francisco, CA",
  bio: "Passionate about creating innovative solutions that make a difference. Always learning and growing in the tech space."
};

export default function TemplateTestPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(testTemplates[0]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Live Template Preview Test</h1>
        
        <div className="flex gap-8">
          {/* Template Selector */}
          <div className="w-1/3">
            <h2 className="text-xl font-semibold mb-4">Select Template</h2>
            <div className="space-y-3">
              {testTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                    selectedTemplate.id === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-gray-500">{template.layout}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Theme: {template.cardTheme} | Color: {template.linkColor}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="w-2/3 flex justify-center">
            <LiveTemplatePreview
              template={selectedTemplate}
              profileData={mockProfileData}
              profileImage="/defaultpp.png"
              companyLogo="/company_logo.png"
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            This page demonstrates the live template preview functionality.
            Select different templates on the left to see how the preview changes dynamically.
          </p>
        </div>
      </div>
    </div>
  );
}
