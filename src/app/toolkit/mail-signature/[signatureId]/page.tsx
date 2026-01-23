"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { EmailSignatureForm } from "@/components/email-signature/email-signature-form";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { usePageLoading } from "@/hooks/use-page-loading";



export default function MailSignatureEditPage() {
  const router = useRouter();  const isLoading = usePageLoading();
  const params = useParams();
  const signatureId = params.signatureId as string;
  console.log("Editing signature with ID:", signatureId);
  // Mock data - in real app, you would fetch this based on signatureId
  const mockSignatureData = {
    id: signatureId,
    name: "FARUK CUBdasdasUK",
    settings: {
      jobTitle: "Co-Founder",
      companyName: "Babel Agency",
      location: "Bursa, Turkey",
      phoneNumber: "+90 555 123 4567",
      email: "contact@babel.agency",
      pronouns: "",
      profilePic: "",
      companyLogo: "",
      bannerImage: "/emailSignatureBgTemp1.png",
      links: [
        { id: "1", type: "instagram", url: "https://instagram.com/username" },
        { id: "2", type: "linkedin", url: "https://linkedin.com/in/username" }
      ],
      colorIcons: true,
      disclaimer: "This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed.",
      theme: "theme1"
    }
  };

  const handleSuccess = () => {
    router.push("/toolkit/mail-signature");
  };

  const handleCancel = () => {
    router.push("/toolkit/mail-signature");
  };

  if (isLoading) {
    return <PageSkeleton variant="simple" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 overflow-hidden to-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-200/60 sticky top-0 z-10 bg-white/95 backdrop-blur-md">
        <div className="flex items-center">
          <button 
            onClick={() => router.push("/toolkit/mail-signature")} 
            className="mr-4 hover:bg-slate-100 p-2 rounded-xl transition-all duration-200 hover:scale-105"
            aria-label="Back"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Edit Email Signature
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-200px)]">
        {/* Form section - scrollable */}
        <div className="overflow-y-auto pb-10 modern-scrollbar p-6 border-r border-slate-200/50 bg-gradient-to-b from-white to-slate-50/30">
          <div className="">            <EmailSignatureForm
              teamId={signatureId}
              initialData={mockSignatureData}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
        
        {/* Preview section - fixed */}
        <div className="relative bg-gradient-to-br from-slate-50/50 to-white">
          {/* Preview fixed at top */}
          <div className="sticky top-0 p-6 bg-white/80 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">Signature Preview</h3>
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 animate-pulse"></div>
              </div>
              <div id="signature-preview" className="border border-slate-200/60 rounded-xl p-6 bg-gradient-to-br from-white to-slate-50/30 min-h-[300px] shadow-inner">
                {/* Preview will be added dynamically */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}