"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { EventBadgeDialog } from "./qr-event-badge";

interface QrCodeViewProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  memberId?: string;
}

export function QrCodeView({ selectedColor, onColorChange, memberId }: QrCodeViewProps) {
  const [isEventBadgeDialogOpen, setIsEventBadgeDialogOpen] = useState(false);
  
  const colorOptions = [
    { name: "white", bg: "#ffffff", label: "White" },
    { name: "black", bg: "#000000", label: "Black" },
    { name: "red", bg: "#ef4444", label: "Red" },
    { name: "orange", bg: "#f97316", label: "Orange" },
    { name: "green", bg: "#22c55e", label: "Green" },
    { name: "blue", bg: "#3b82f6", label: "Blue" },
    { name: "purple", bg: "#a855f7", label: "Purple" },
  ];

  return (
    <motion.div 
      className="flex flex-col space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.span 
        className="text-lg font-semibold"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        QR Code
      </motion.span>
        <motion.span 
        className="cursor-pointer hover:border-gray-800 transition-all duration-300 text-center text-xs font-semibold flex justify-center items-center gap-2 rounded-full border p-1.5 mt-2 text-gray-600 px-0.5 w-44 hover:scale-105 hover:shadow-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsEventBadgeDialogOpen(true)}
      >
        <motion.span
          
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Plus className="w-4"/>
        </motion.span>
        Create Event Badge
      </motion.span> 
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
          <motion.h3 
            className="text-md font-medium mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            Choose QR Code Color
          </motion.h3>
          
          <motion.div 
            className="flex items-center gap-3 ml-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {colorOptions.map((color, index) => (
              <motion.button
                key={color.name}
                onClick={() => onColorChange(color.name)}
                className={`h-8 w-8 rounded-full border shadow-sm hover:shadow-md transition-all duration-300 ${
                  selectedColor === color.name ? "ring-2 ring-offset-2 ring-black scale-110" : ""
                } ${color.name === "white" ? "flex items-center justify-center" : ""}`}
                style={{ backgroundColor: color.bg }}
                aria-label={color.label}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.8 + (index * 0.1),
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                whileHover={{ 
                  scale: 1.2, 
                  rotate: 10,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.9,
                  transition: { duration: 0.1 }
                }}
              >
                {color.name === "white" && (
                  <motion.div 
                    className="h-5 w-5 rounded-full border border-gray-300"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + (index * 0.1) }}
                  />
                )}
              </motion.button>
            ))}          </motion.div>
        </Card>
      </motion.div>      <EventBadgeDialog 
        open={isEventBadgeDialogOpen}
        onOpenChange={setIsEventBadgeDialogOpen}
        memberId={memberId}
      />
    </motion.div>
  );
}
