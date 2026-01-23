"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useEmailSignatures } from "@/hooks/use-email-signatures";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailSignatureDialogProps {
  teamId: string;
  onSuccess?: () => void;
  initialData?: any;
  triggerButton?: React.ReactNode;
  title?: string;
}

export function EmailSignatureDialog({
  teamId,
  onSuccess,
  triggerButton
}: EmailSignatureDialogProps) {
  const { createSignature } = useEmailSignatures({ teamId });
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      const signatureData = {
        name: "New Email Signature",
        html: "",
        teamId,
        settings: {
          jobTitle: "Co-Founder",
          companyName: "My Company",
          location: "",
          phoneNumber: "",
          email: "",
          pronouns: "",
          profilePic: "",
          companyLogo: "",
          bannerImage: "",
          links: [],
          colorIcons: true,
          disclaimer: "",
          theme: "default"
        }
      };

      await createSignature(signatureData);
      toast({
        title: "Success",
        description: "Email signature created successfully"
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create email signature"
      });
    }
  };

  return triggerButton || (
    <Button onClick={handleClick} className="gap-1 rounded-full">
      <Plus size={18} />
      Create Email Signature
    </Button>
  );
}