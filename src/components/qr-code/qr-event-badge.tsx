"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/lib/api";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';

interface EventBadgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId?: string;
  userProfile?: {
    name: string;
    jobTitle: string;
    company: string;
    location: string;
    profilePhoto?: string;
  };
}

export function EventBadgeDialog({
  open,
  onOpenChange,
  memberId,
  userProfile = {
    name: "Faruk Çubuk",
    jobTitle: "Co-Founder",
    company: "Babel Agency",
    location: "Bursa",
  },
}: EventBadgeDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<
    "badge" | "nameTag" | "square"
  >("badge");
  const [callToActionText, setCallToActionText] = useState("Scan to connect");  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [profileImageDataUrl, setProfileImageDataUrl] = useState<string>("");
  const [companyLogoDataUrl, setCompanyLogoDataUrl] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const { user, fetchUser, isLoading: isUserLoading } = useUserStore();
  const [checkedItems, setCheckedItems] = useState({
    profilePhoto: true,
    name: true,
    jobTitle: true,
    company: true,
    location: true,
    qrCode: true,
    callToAction: true,
    qrCodeLogo: true,
    companyLogo: true,
  });

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const params = useParams();
  const searchParams = useSearchParams();
  const index = searchParams.get("index");

  const { data, isPending, isError } = useQuery({
    queryKey: ["member", memberId],
    queryFn: async () => {
      if (memberId) {
        const response = await Api.get(`/user/${memberId}/card?index=${index}`);
        return response;
      }
      return null;
    },
    enabled: !!memberId,
    retry: false,
  });

  const member = data?.data?.userCard;

  useEffect(() => {    const convertImageToDataUrl = async (imageUrl: string): Promise<string> => {
      try {
        // Eğer URL zaten data URL ise direkt döndür
        if (imageUrl.startsWith('data:')) {
          return imageUrl;
        }
        
        // Relative path'ler için direkt döndür
        if (!imageUrl.startsWith('http')) {
          return imageUrl;
        }        // Canvas kullanarak görüntüyü data URL'e çevir
        return new Promise((resolve, reject) => {
          const img = document.createElement('img');
          img.crossOrigin = 'anonymous';
          
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              if (!ctx) {
                resolve(imageUrl);
                return;
              }
              
              canvas.width = img.width;
              canvas.height = img.height;
              
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL('image/png');
              resolve(dataUrl);
            } catch (error) {
              console.error('Canvas conversion failed:', error);
              resolve(imageUrl);
            }
          };
            img.onerror = () => {
            console.error('Image load failed, trying proxy:', imageUrl);
            // Proxy kullanarak tekrar dene
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
            img.src = proxyUrl;
            
            img.onerror = () => {
              console.error('Proxy also failed:', imageUrl);
              resolve(imageUrl);
            };
          };
          
          img.src = imageUrl;
        });
      } catch (error) {
        console.error("Error converting image to data URL:", error);
        return imageUrl;
      }
    };    const generateDataUrls = async () => {
      console.log("generateDataUrls called with member:", member);
      
      try {
        let qrDataUrl = "";
        if (member?.qrCodeUrl) {
          console.log("Using member QR code URL:", member.qrCodeUrl);
          qrDataUrl = await convertImageToDataUrl(member.qrCodeUrl);
        } else if (member?.username) {
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&ecc=M&margin=0&data=${encodeURIComponent(`https://app.popl.co/${member.username}`)}`;
          console.log("Generated QR URL:", qrUrl);
          qrDataUrl = await convertImageToDataUrl(qrUrl);
        } else {
          // Fallback QR code
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&ecc=M&margin=0&data=${encodeURIComponent("https://app.popl.co/demo")}`;
          console.log("Using fallback QR URL:", qrUrl);
          qrDataUrl = await convertImageToDataUrl(qrUrl);
        }
        console.log("QR Data URL result:", qrDataUrl);
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
        // Fallback olarak default QR kullan
        setQrCodeDataUrl("/defaultqr.png");
      }

      try {
        const profileUrl = member?.profilePicture || "/defaultpp.png";
        console.log("Profile URL:", profileUrl);
        if (profileUrl.startsWith("http")) {
          const profileDataUrl = await convertImageToDataUrl(profileUrl);
          console.log("Profile Data URL result:", profileDataUrl);
          setProfileImageDataUrl(profileDataUrl);
        } else {
          setProfileImageDataUrl(profileUrl);
        }
      } catch (error) {
        console.error("Error generating profile image:", error);
        setProfileImageDataUrl(member?.profilePicture || "/defaultpp.png");
      }

      try {
        const companyLogoUrl = member?.companyLogo || "/defaultcompanylogo.png";
        console.log("Company Logo URL:", companyLogoUrl);
        if (companyLogoUrl.startsWith("http")) {
          const companyLogoDataUrl = await convertImageToDataUrl(companyLogoUrl);
          console.log("Company Logo Data URL result:", companyLogoDataUrl);
          setCompanyLogoDataUrl(companyLogoDataUrl);
        } else {
          setCompanyLogoDataUrl(companyLogoUrl);
        }
      } catch (error) {
        console.error("Error generating company logo:", error);
        setCompanyLogoDataUrl(member?.companyLogo || "/defaultcompanylogo.png");
      }
    };if (open && (member?.username || member?.qrCodeUrl || member?.profilePicture || member?.companyLogo)) {
      generateDataUrls();
    }
  }, [member, open]);

  const handleCheckboxChange = (key: keyof typeof checkedItems) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      const elementId = `${selectedTemplate}-preview`;
      const element = document.getElementById(elementId);
      
      if (!element) {
        throw new Error("Preview element not found");
      }      await new Promise(resolve => setTimeout(resolve, 1000));      const dataUrl = await domtoimage.toPng(element, {
        quality: 1.0,
        bgcolor: '#ffffff',
        width: element.offsetWidth * 2,
        height: element.offsetHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: element.offsetWidth + 'px',
          height: element.offsetHeight + 'px'
        },
        filter: (node: Node) => {
          const element = node as Element;
          return !element.classList?.contains('exclude-from-export');
        },
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      });

      const link = document.createElement('a');
      link.download = `event-badge-${selectedTemplate}-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('İndirme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (isPrinting || isDownloading) return;
    
    setIsPrinting(true);
    
    try {
      const elementId = `${selectedTemplate}-preview`;
      const element = document.getElementById(elementId);
      
      if (!element) {
        throw new Error("Preview element not found");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));      // Dom-to-image ile önce PNG oluştur
      const dataUrl = await domtoimage.toPng(element, {
        quality: 1.0,
        bgcolor: '#ffffff',
        width: element.offsetWidth * 2,
        height: element.offsetHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: element.offsetWidth + 'px',
          height: element.offsetHeight + 'px'
        },
        filter: (node: Node) => {
          const element = node as Element;
          return !element.classList?.contains('exclude-from-export');
        },
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      });

      // Template boyutlarını al
      const templateDimensions = {
        badge: { width: 450, height: 550 },
        nameTag: { width: 400, height: 300 },
        square: { width: 550, height: 550 },
      };

      const dimensions = templateDimensions[selectedTemplate];

      // PDF oluştur
      const pdf = new jsPDF({
        orientation: dimensions.width > dimensions.height ? "landscape" : "portrait",
        unit: "px",
        format: [dimensions.width, dimensions.height],
      });

      // Resmi PDF'e ekle
      pdf.addImage(dataUrl, "PNG", 0, 0, dimensions.width, dimensions.height);

      // Print preview açmak için blob oluştur
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Print window aç
      const printWindow = window.open(pdfUrl, '_blank', 'width=800,height=600');
      
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            try {
              printWindow.print();
              printWindow.onafterprint = () => {
                printWindow.close();
                URL.revokeObjectURL(pdfUrl);
              };
              // Fallback close after 10 seconds
              setTimeout(() => {
                if (!printWindow.closed) {
                  printWindow.close();
                }
                URL.revokeObjectURL(pdfUrl);
              }, 10000);
            } catch (e) {
              console.warn("Direct print failed:", e);
              printWindow.close();
              URL.revokeObjectURL(pdfUrl);
              alert("Print penceresi açılamadı. Lütfen popup'ları etkinleştirin.");
            }
          }, 500);
        };

        printWindow.onerror = () => {
          printWindow.close();
          URL.revokeObjectURL(pdfUrl);
          alert("Print penceresi açılamadı. Lütfen popup'ları etkinleştirin.");
        };
      } else {
        URL.revokeObjectURL(pdfUrl);
        alert("Print penceresi açılamadı. Lütfen popup'ları etkinleştirin.");
      }
      
    } catch (error) {
      console.error('Print failed:', error);
      alert('Print sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 gap-0">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex h-full">
          <div className="flex-1 flex-col justify-between p-6 bg-white">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-left">
                Event Badges
              </DialogTitle>
              <p className="text-gray-600 text-sm text-left mt-2">
                Download a printable QR code event badge for any upcoming
                events. This QR code will automatically share the member&apos;s
                Popl digital business card with others.
              </p>
            </DialogHeader>

            <div className="mb-8">
              <div className="flex gap-2 justify-between mb-6">
                <button
                  onClick={() => setSelectedTemplate("badge")}
                  className={`flex w-full flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    selectedTemplate === "badge"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-8 h-10 bg-gray-200 rounded-md mb-2 flex items-center justify-center relative">
                    <div className="w-5 h-7 bg-gray-400 rounded-sm"></div>
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">Badge</span>
                  {selectedTemplate === "badge" && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full mt-2 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setSelectedTemplate("nameTag")}
                  className={`flex w-full flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    selectedTemplate === "nameTag"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-10 h-6 bg-gray-200 rounded mb-2 flex items-center justify-center">
                    <div className="w-8 h-4 bg-gray-400 rounded-sm"></div>
                  </div>
                  <span className="text-sm font-medium">Name Tag</span>
                  {selectedTemplate === "nameTag" && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full mt-2 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setSelectedTemplate("square")}
                  className={`flex w-full flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    selectedTemplate === "square"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded mb-2 flex items-center justify-center">
                    <div className="w-6 h-6 bg-gray-400 rounded-sm"></div>
                  </div>
                  <span className="text-sm font-medium">Square</span>
                  {selectedTemplate === "square" && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full mt-2 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-16">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={checkedItems.profilePhoto}
                    onCheckedChange={() => handleCheckboxChange("profilePhoto")}
                  />
                  <label className="text-sm font-medium">Profile Photo</label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={checkedItems.jobTitle}
                    onCheckedChange={() => handleCheckboxChange("jobTitle")}
                  />
                  <label className="text-sm font-medium">Job Title</label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={checkedItems.location}
                    onCheckedChange={() => handleCheckboxChange("location")}
                  />
                  <label className="text-sm font-medium">Location</label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={checkedItems.callToAction}
                    onCheckedChange={() => handleCheckboxChange("callToAction")}
                  />
                  <label className="text-sm font-medium">Call to Action</label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={checkedItems.name}
                    onCheckedChange={() => handleCheckboxChange("name")}
                  />
                  <label className="text-sm font-medium">Name</label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={checkedItems.company}
                    onCheckedChange={() => handleCheckboxChange("company")}
                  />
                  <label className="text-sm font-medium">Company</label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={checkedItems.qrCode}
                    onCheckedChange={() => handleCheckboxChange("qrCode")}
                  />
                  <label className="text-sm font-medium">QR Code</label>
                </div>                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={checkedItems.qrCodeLogo}
                    onCheckedChange={() => handleCheckboxChange("qrCodeLogo")}
                  />
                  <label className="text-sm font-medium">QR Code Logo</label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={checkedItems.companyLogo}
                    onCheckedChange={() => handleCheckboxChange("companyLogo")}
                  />
                  <label className="text-sm font-medium">Company Logo</label>
                </div>
              </div>
            </div>

            <div className="">
              <label className="block text-sm font-medium mb-2">
                Call to action text
              </label>
              <Input
                value={callToActionText}
                onChange={(e) => setCallToActionText(e.target.value)}
                placeholder="Scan to connect"
                className="w-full border-none p-5 bg-[#f8f8f8] text-black/80 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex h-32 items-end gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>              <Button
                onClick={handleDownload}
                disabled={isDownloading || isPrinting}
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white disabled:opacity-50"
              >
                {isDownloading ? "İndiriliyor..." : "Download"}
              </Button>
              <Button
                onClick={handlePrint}
                disabled={isPrinting || isDownloading}
                className="flex-1 bg-black hover:bg-gray-800 text-white disabled:opacity-50"
              >                {isPrinting ? "Yazdırılıyor..." : "Print"}
              </Button>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 p-8 flex flex-col items-center justify-center border-l">
            <div className="text-center mb-4 w-full">
              <span className="text-sm text-gray-600">Preview</span>
            </div>
            
            {selectedTemplate === "badge" && (
              <div
                id="badge-preview"
                className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center"
                style={{ width: "450px", height: "auto", minHeight: "550px" }}
              >
                {checkedItems.profilePhoto && (
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">                    <Image
                      src={profileImageDataUrl || member?.profilePicture || "/defaultpp.png"}
                      width={64}
                      height={64}
                      alt="Profile Photo"
                      className="w-16 h-16 rounded-full object-cover object-center"
                      crossOrigin="anonymous"
                      unoptimized
                    />
                  </div>
                )}
                {checkedItems.name && (
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {member?.name || userProfile.name}
                  </h2>
                )}
                {checkedItems.jobTitle && (
                  <p className="text-lg text-gray-700 mb-1">
                    {member?.jobTitle || userProfile.jobTitle}
                  </p>
                )}                {checkedItems.company && (
                  <p className="text-lg font-medium text-gray-800 mb-2">
                    {member?.company || userProfile.company}
                  </p>
                )}
                {checkedItems.companyLogo && (
                  <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center overflow-hidden p-2">                    <Image
                      src={companyLogoDataUrl || member?.companyLogo || "/defaultcompanylogo.png"}
                      width={64}
                      height={64}
                      alt="Company Logo"
                      className="w-full h-full object-contain"
                      crossOrigin="anonymous"
                      unoptimized
                    />
                  </div>
                )}
                {checkedItems.location && (
                  <p className="text-gray-600 mb-6">
                    {member?.location || userProfile.location}
                  </p>
                )}
                {checkedItems.qrCode && (
                  <div className="mb-4">
                    <div className="w-32 h-32 bg-white border-2 border-gray-200 mx-auto mb-4 flex items-center justify-center p-2">                      <Image
                        src={qrCodeDataUrl || "/defaultqr.png"}
                        alt="Dynamic QR Code"
                        className="w-full h-full"
                        width={128}
                        height={128}
                        crossOrigin="anonymous"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
                {checkedItems.callToAction && (
                  <p className="text-lg font-semibold text-gray-900">
                    {callToActionText}
                  </p>
                )}
              </div>
            )}

            {selectedTemplate === "nameTag" && (
              <div
                id="nameTag-preview"
                className="bg-white rounded-lg flex shadow-lg p-6 w-full h-[60%] items-center max-w-md"
                style={{ width: "400px", height: "300px" }}
              >
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {checkedItems.profilePhoto && (
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center overflow-hidden">                        <Image
                          src={profileImageDataUrl || member?.profilePicture || "/defaultpp.png"}
                          width={80}
                          height={80}
                          alt="Profile Photo"
                          className="w-20 h-20 rounded-full object-cover object-center"
                          crossOrigin="anonymous"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    {checkedItems.name && (
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {member?.name || userProfile.name}
                      </h2>
                    )}
                    {checkedItems.jobTitle && (
                      <p className="text-sm text-gray-700 mb-1">
                        {member?.jobTitle || userProfile.jobTitle}
                      </p>
                    )}
                    {checkedItems.company && (
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {member?.company || userProfile.company}
                      </p>
                    )}                    {checkedItems.location && (
                      <p className="text-xs text-gray-600">
                        {member?.location || userProfile.location}
                      </p>
                    )}
                    {checkedItems.companyLogo && (
                      <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden p-1 mt-2">                        <Image
                          src={companyLogoDataUrl || member?.companyLogo || "/defaultcompanylogo.png"}
                          width={48}
                          height={32}
                          alt="Company Logo"
                          className="w-full h-full object-contain"
                          crossOrigin="anonymous"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-center">
                    {checkedItems.qrCode && (
                      <div className="w-24 h-24 bg-white flex items-center justify-center mb-2 p-2">                        <Image
                          src={qrCodeDataUrl || "/defaultqr.png"}
                          alt="Dynamic QR Code"
                          width={96}
                          height={96}
                          className="w-full h-full"
                          crossOrigin="anonymous"
                          unoptimized
                        />
                      </div>
                    )}
                    {checkedItems.callToAction && (
                      <p className="text-xs font-semibold text-gray-900">
                        {callToActionText}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedTemplate === "square" && (
              <div
                id="square-preview"
                className="bg-white rounded-lg shadow-lg p-6 w-[400px] h-[400px] flex flex-col items-center justify-center text-center"
                style={{ width: "550px", height: "550px" }}
              >
                {checkedItems.profilePhoto && (
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mb-3 flex items-center justify-center overflow-hidden">                    <Image
                      src={profileImageDataUrl || member?.profilePicture || "/defaultpp.png"}
                      width={48}
                      height={48}
                      alt="Profile Photo"
                      className="w-12 h-12 rounded-full object-cover object-center"
                      crossOrigin="anonymous"
                      unoptimized
                    />
                  </div>
                )}
                {checkedItems.name && (
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    {member?.name || userProfile.name}
                  </h2>
                )}
                {checkedItems.jobTitle && (
                  <p className="text-sm text-gray-700 mb-1">
                    {member?.jobTitle || userProfile.jobTitle}
                  </p>
                )}
                {checkedItems.company && (
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    {member?.company || userProfile.company}
                  </p>
                )}                {checkedItems.location && (
                  <p className="text-xs text-gray-600 mb-3">
                    {member?.location || userProfile.location}
                  </p>
                )}
                {checkedItems.companyLogo && (
                  <div className="w-16 h-10 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden p-2 mb-3">                    <Image
                      src={companyLogoDataUrl || member?.companyLogo || "/defaultcompanylogo.png"}
                      width={64}
                      height={40}
                      alt="Company Logo"
                      className="w-full h-full object-contain"
                      crossOrigin="anonymous"
                      unoptimized
                    />
                  </div>
                )}
                {checkedItems.qrCode && (
                  <div className="w-20 h-20 bg-white border border-gray-200 flex items-center justify-center mb-2 p-2">                    <Image
                      src={qrCodeDataUrl || "/defaultqr.png"}
                      alt="Dynamic QR Code"
                      width={80}
                      height={80}
                      className="w-full h-full"
                      crossOrigin="anonymous"
                      unoptimized
                    />
                  </div>
                )}
                {checkedItems.callToAction && (
                  <p className="text-xs font-semibold text-gray-900">
                    {callToActionText}
                  </p>
                )}
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-500">
              {selectedTemplate === "badge" && "450 × 550 px"}
              {selectedTemplate === "nameTag" && "400 × 300 px"}
              {selectedTemplate === "square" && "550 × 550 px"}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}