import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Background images
const backgroundImages = Array.from({ length: 12 }, (_, i) => `/virtualBackground/${i + 1}.jpeg`);

export interface VirtualBackgroundProps {
  profileImage: string;
  companyLogo?: string;
  name: string;
  company: string;
  jobTitle?: string;
  location?: string;
  onBackgroundChange: (background: string) => void;
  onQRCodeChange: (show: boolean) => void;
  onNameChange: (show: boolean) => void;
  onJobTitleChange: (show: boolean) => void;
  onLocationChange: (show: boolean) => void;
  onCompanyChange: (show: boolean) => void;
  selectedBackground: string;
  showQRCode: boolean;
  showName: boolean;
  showJobTitle: boolean;
  showLocation: boolean;
  showCompany: boolean;
}

export const VirtualBackground: React.FC<VirtualBackgroundProps> = ({
  profileImage,
  companyLogo,
  name,
  company,
  jobTitle,
  location,
  onBackgroundChange,
  onQRCodeChange,
  onNameChange,
  onJobTitleChange,
  onLocationChange,
  onCompanyChange,
  selectedBackground,
  showQRCode,
  showName,
  showJobTitle,
  showLocation,
  showCompany,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Virtual Background</h2>
        <p className="text-sm text-gray-600 mb-4">
          Create a customized virtual background for your video calls that showcases your personal brand and contact information.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Settings</h3>          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showQRCode" 
                checked={showQRCode} 
                onCheckedChange={(checked) => onQRCodeChange(!!checked)} 
              />
              <Label htmlFor="showQRCode">Show QR Code</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showName" 
                checked={showName} 
                onCheckedChange={(checked) => onNameChange(!!checked)} 
              />
              <Label htmlFor="showName">Show Name</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showJobTitle" 
                checked={showJobTitle} 
                onCheckedChange={(checked) => onJobTitleChange(!!checked)} 
              />
              <Label htmlFor="showJobTitle">Show Job Title</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showCompany" 
                checked={showCompany} 
                onCheckedChange={(checked) => onCompanyChange(!!checked)} 
              />
              <Label htmlFor="showCompany">Show Company</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showLocation" 
                checked={showLocation} 
                onCheckedChange={(checked) => onLocationChange(!!checked)} 
              />
              <Label htmlFor="showLocation">Show Location</Label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Background Images</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select a background image for your virtual background.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {backgroundImages.map((image, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${selectedBackground === image ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                onClick={() => onBackgroundChange(image)}
              >
                <CardContent className="p-0">
                  <div className="relative w-full h-28">
                    <Image 
                      src={image} 
                      alt={`Background ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualBackground;
