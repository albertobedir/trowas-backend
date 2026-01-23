"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface DropdownItem2 {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  [key: string]: any; // Allow additional properties
}

interface SelectableDropdownProps {
  items: DropdownItem2[];
  buttonText: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonClassName?: string;
  placeholder?: string;
  onItemSelect: (selectedIds: string[]) => void;
  emptyMessage?: string;
  maxHeight?: string;
  width?: string;
}

export function SelectableDropdown({
  items,
  buttonText,
  buttonVariant = "outline",
  buttonClassName = "rounded-full text-sm px-4 py-2 h-auto border-gray-200 text-gray-600",
  placeholder = "Search...",
  onItemSelect,
  emptyMessage = "No items found",
  maxHeight = "300px",
  width = "350px",
}: SelectableDropdownProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCheckboxChange = (itemId: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (selectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleAddClick = () => {
    const selectedIds = Array.from(selectedItems);
    onItemSelect(selectedIds);
    setSelectedItems(new Set());
    setSearchTerm("");
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={buttonVariant}
          className={buttonClassName}
        >
          {buttonText}
        </Button>
      </DropdownMenuTrigger>    
      <DropdownMenuContent 
        className="w-[350px]" 
        style={{ width }}
        side="bottom"
        align="start"
        sideOffset={5}
      >
        <div className="p-2">
          <Input
            placeholder={placeholder}
            className="modern-scrollbar rounded-full p-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[300px]" style={{ maxHeight }}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="cursor-pointer p-3 focus:bg-gray-50"
                onSelect={(e) => {
                  e.preventDefault();
                  handleCheckboxChange(item.id);
                }}
              >
                <div className="flex items-center space-x-3 w-full">
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => handleCheckboxChange(item.id)}
                    className="mr-2"
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.avatar} alt={item.name} />
                    <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-sm text-gray-500">{item.description}</div>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-3 text-center text-sm text-gray-500">{emptyMessage}</div>
          )}
        </ScrollArea>        <DropdownMenuSeparator />
        <div className="p-2 flex justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={handleAddClick}
            className="w-24"
          >
            Update
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
