"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Api } from "@/lib/api";

interface AdminRolesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    _id: string;
    name: string;
    teamId: string;
    role: boolean;
    image?: string;
  };
}

function clearDialogBodyLock() {
  document.body.style.pointerEvents = "";
  document.body.style.overflow = "";
  document.body.removeAttribute("data-scroll-locked");
}

export function AdminRolesDialog({
  isOpen,
  onClose,
  user,
}: AdminRolesDialogProps) {
  const [roleuser, setroleuser] = useState(user.role);

  useEffect(() => {
    setroleuser(user.role);
  }, [user.role, user._id]);

  useEffect(() => {
    if (!isOpen) {
      clearDialogBodyLock();
    }

    return () => {
      clearDialogBodyLock();
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    requestAnimationFrame(() => {
      clearDialogBodyLock();
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Admin Roles</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-6 flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{user.name}</h4>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <h4 className="font-medium">Full Team Admin</h4>
                <p className="text-sm text-muted-foreground">
                  Full Team Admins can not also be Subteam Admins
                </p>
              </div>
              <Switch
                checked={roleuser}
                onCheckedChange={(checked) => setroleuser(checked)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  const endpoint = `/teams/${user.teamId}/members/${user._id}/update-role?role=${roleuser ? "manager" : "member"}`;
                  await Api.patch(endpoint);
                  toast.success("Role updated successfully");
                  handleClose();
                } catch (error) {
                  toast.error("Failed to update role");
                  console.error("Error updating role:", error);
                }
              }}
            >
              Apply Roles
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
