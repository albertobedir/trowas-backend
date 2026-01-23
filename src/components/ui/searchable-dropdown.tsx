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

export interface DropdownItem {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  [key: string]: any; // Allow additional properties
}

interface SearchableDropdownProps {
  items: DropdownItem[];
  buttonText: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonClassName?: string;
  placeholder?: string;
  onItemSelect: (item: DropdownItem) => void;
  emptyMessage?: string;
  maxHeight?: string;
  width?: string;
}

export function SearchableDropdown({
  items,
  buttonText,
  buttonVariant = "outline",
  buttonClassName = "rounded-full text-sm px-4 py-2 h-auto border-gray-200 text-gray-600",
  placeholder = "Search...",
  onItemSelect,
  emptyMessage = "No items found",
  maxHeight = "300px",
  width = "350px",
}: SearchableDropdownProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <div className="max-h-[300px] overflow-y-auto" style={{ maxHeight }}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="cursor-pointer p-3 focus:bg-gray-50"
                onClick={() => {
                  onItemSelect(item);
                  setSearchTerm(""); // Reset search after selection
                }}
              >
                <div className="flex items-center space-x-3 w-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.avatar} alt={item.name} />
                    <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                      {getInitials(item.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-xs text-gray-500 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500 text-sm">
              {emptyMessage}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
