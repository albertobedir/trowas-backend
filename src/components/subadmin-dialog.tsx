"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface SubadminDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  selectedSubadmins: string[];
  onToggleSubadmin: (userId: string) => void;
  onSave: () => void;
}

export function SubadminDialog({
  isOpen,
  onOpenChange,
  users,
  selectedSubadmins,
  onToggleSubadmin,
  onSave,
}: SubadminDialogProps) {
  const handleCheckboxClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    onToggleSubadmin(userId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Subadmins</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ScrollArea className="h-[300px] pr-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => onToggleSubadmin(user.id)}
              >
                <div onClick={(e) => handleCheckboxClick(e, user.id)}>
                  <Checkbox
                    checked={selectedSubadmins.includes(user.id)}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            onSave();
            onOpenChange(false);
          }}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
