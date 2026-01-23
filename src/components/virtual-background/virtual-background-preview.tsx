import React, { useRef } from "react";
import Image from "next/image";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface VirtualBackgroundPreviewProps {
  backgroundImage: string;
  profileImage: string;
  companyLogo?: string;
  name: string;
  company: string;
  jobTitle?: string;
  location?: string;
  showQRCode: boolean;
  showName: boolean;
  showJobTitle: boolean;
  showLocation: boolean;
  showCompany: boolean;
  qrCodeUrl?: string;
  qrCodeColor?: string;
}

export const VirtualBackgroundPreview: React.FC<VirtualBackgroundPreviewProps> = ({
  backgroundImage,
  profileImage,
  companyLogo,
  name,
  company,
  jobTitle,
  location,
  showQRCode,
  showName,
  showJobTitle = true,
  showLocation = true,
  showCompany = true,
  qrCodeUrl = "/qrcode.png",
  qrCodeColor = "black",
}) => {
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Function to calculate hue-rotate value based on color
  const getHueRotate = (color: string): string => {
    switch (color) {
      case 'red': return '0deg';     // Red is base for hue-rotate
      case 'orange': return '30deg';
      case 'yellow': return '60deg';
      case 'green': return '120deg';
      case 'blue': return '240deg';
      case 'purple': return '280deg';
      default: return '0deg';        // Default (black)
    }
  };

  const handleDownload = async () => {
    if (!backgroundRef.current) return;

    try {
      const canvas = await html2canvas(backgroundRef.current, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 2,
      } as any);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `virtual-background-${new Date().getTime()}.jpg`;
      link.click();
    } catch (err) {
      console.error("Error generating background image:", err);
    }
  };

  return (
    <div className="flex flex-col items-center h-full">
      <div className="text-xs flex flex-col space-y-5 text-center">
        <p className="text-[#828282] font-semibold">Virtual background preview</p>
      </div>

      <div
        ref={backgroundRef}
        className="relative w-full aspect-video mt-4 overflow-hidden rounded-lg shadow-md"
        style={{ maxWidth: "360px" }}
      >
        {/* Background Image */}
        <Image
          src={backgroundImage}
          alt="Virtual Background"
          fill
          className="object-cover"
        />        {/* QR Code - Top Right */}
        {showQRCode && (
          <div className="absolute top-4 right-4">
            <div className="bg-white p-2 rounded-lg shadow-md w-20 h-20 flex items-center justify-center">
              <div style={{ filter: qrCodeColor !== "white" ? `invert(1) sepia(1) saturate(5) hue-rotate(${getHueRotate(qrCodeColor)})` : 'none' }}>
                <Image
                  src={qrCodeUrl || "/qrcode.png"}
                  alt="QR Code"
                  width={72}
                  height={72}
                  className="object-contain"
                  // Fallback if QR code image isn't available
                  onError={(e) => {
                    e.currentTarget.src = "/connect-with-me.png";
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* User Information - Top Left */}
        <div className="absolute top-4 left-4 flex items-start space-x-3">
          {/* Profile image */}

          {/* User details */}
          {showName && (
            <div className="bg-white/80 backdrop-blur-sm rounded-md px-3 py-1.5 shadow-sm">
              {/* Name */}
              <p className="font-medium text-sm">{name}</p>

              {/* Job Title */}
              {showJobTitle && jobTitle && (
                <p className="text-xs text-gray-600">{jobTitle}</p>
              )}

              {/* Company */}
              {showCompany && company && (
                <p className="text-xs text-gray-600">{company}</p>
              )}

              {/* Location */}
              {showLocation && location && (
                <p className="text-xs text-gray-600">{location}</p>
              )}
            </div>
          )}
        </div>

        {/* "Copy of [Name]" overlay */}

      </div>

      {/* Download button */}
      <Button
        className="mt-6 gap-2"
        onClick={handleDownload}
      >
        <Download className="h-4 w-4" /> Download background
      </Button>


    </div>
  );
};

export default VirtualBackgroundPreview;