"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface QrCodeViewProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function QrCodeView({ selectedColor, onColorChange }: QrCodeViewProps) {
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
      className="flex flex-col space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
          <motion.h3 
            className="text-md font-medium mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Choose QR Code Color
          </motion.h3>
          
          <motion.div 
            className="flex items-center gap-3 ml-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
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
                  duration: 0.6, 
                  delay: 0.6 + (index * 0.1),
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                whileHover={{ 
                  scale: 1.25, 
                  rotate: 15,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.85,
                  transition: { duration: 0.1 }
                }}
              >
                {color.name === "white" && (
                  <motion.div 
                    className="h-5 w-5 rounded-full border border-gray-300"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + (index * 0.1) }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
