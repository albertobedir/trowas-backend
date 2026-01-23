"use client";

import React, { useState } from "react";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus } from "lucide-react";
import { EmailSignature } from "@/hooks/use-email-signatures";

interface Member {
  profileImage: string;
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface ManageMembersDialogProps {
  signatureId: string;
  signatureName: string;
  currentMembers: Member[];
  allTeamMembers: Member[];
  onSave: (members: Member[]) => Promise<void>;
}

export function ManageMembersDialog({
  signatureId,
  signatureName,
  currentMembers,
  allTeamMembers,
  onSave
}: ManageMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Member[]>(currentMembers);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMemberToggle = (member: Member) => {
    setSelectedMembers(prev => {
      const exists = prev.some(m => m._id === member._id);
      if (exists) {
        return prev.filter(m => m._id !== member._id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await onSave(selectedMembers);
      setOpen(false);
    } catch (error) {
      console.error("Failed to save members:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full text-xs">
          <UserPlus size={14} />
          Manage members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Members for {`"${signatureName}"`}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Select team members who will use this email signature
            </p>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {allTeamMembers.map((member) => (
              <div key={member._id} className="flex items-center gap-3 p-2 border-b">
                <Checkbox
                  id={`member-${member._id}`}
                  checked={selectedMembers.some(m => m._id === member._id)}
                  onCheckedChange={() => handleMemberToggle(member)}
                />
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {member.profileImage && (
                    <Image
                      src={member.profileImage}
                      alt={member.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <label
                  htmlFor={`member-${member._id}`}
                  className="flex-1 text-sm cursor-pointer"
                >
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}