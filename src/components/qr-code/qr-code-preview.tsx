"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";

interface QrCodePreviewProps {
  userId: string;
  userName: string;
  index: string | null;
  qrCodePath?: string;
  selectedColor?: string;
  onColorChange?: (color: string) => void;
}

export function QrCodePreview({ userId, index, userName, qrCodePath, selectedColor = "black", onColorChange }: QrCodePreviewProps) {
  const [qrCodeSvg, setQrCodeSvg] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#000000");

  // Get color hex value from color name - wrapped with useCallback
  const getColorHex = useCallback((color: string): string => {
    // If it's a hex color (custom color), return as is
    if (color.startsWith("#")) {
      return color;
    }

    switch (color) {
      case "red": return "#FF0000";
      case "orange": return "#FFA500";
      case "green": return "#008000";
      case "blue": return "#0000FF";
      case "purple": return "#800080";
      case "custom": return customColor;
      default: return "#000000";
    }
  }, [customColor]);

  // Handle custom color picker
  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    if (onColorChange) {
      onColorChange(color);
    }
  };

  // Check if current color should show color picker
  const shouldShowColorPicker = selectedColor === "custom" || selectedColor === "white";

  // Generate QR code as SVG
  useEffect(() => {
    const generateQrCode = async () => {
      try {
        const profileUrl = `${window.location.origin}/connect/${userId}?index=${index}&from=1`;
        let colorHex = getColorHex(selectedColor);

        // If "white" is selected, show color picker and use custom color
        if (selectedColor === "white") {
          setShowColorPicker(true);
          colorHex = customColor;
        } else {
          setShowColorPicker(false);
        }

        // Generate SVG string
        const svgString = await QRCode.toString(profileUrl, {
          type: 'svg',
          width: 200,
          margin: 2,
          color: {
            dark: colorHex,
            light: "#FFFFFF"
          }
        });

        setQrCodeSvg(svgString);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    if (userId) {
      generateQrCode();
    }
  }, [userId, selectedColor, customColor, getColorHex, index]);

  // Convert SVG to data URL for download
  const downloadQrCode = async () => {
    try {
      if (!qrCodeSvg) return;

      // Create a data URL from SVG
      const svgBlob = new Blob([qrCodeSvg], { type: 'image/svg+xml' });
      const svgDataUrl = URL.createObjectURL(svgBlob);

      // Create image from SVG
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = svgDataUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = `${userName.replace(/\s+/g, '-')}-qr-code.png`;
      link.href = dataUrl;
      link.click();

      // Clean up
      URL.revokeObjectURL(svgDataUrl);
    } catch (err) {
      console.error("Error downloading QR code:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="p-6 flex flex-col items-center justify-center hover:shadow-xl transition-shadow duration-300">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* QR Code SVG */}
          <motion.div
            className="relative w-64 h-64 p-4 border rounded-xl shadow-sm mb-4 flex items-center justify-center bg-white overflow-hidden"
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            whileHover={{
              scale: 1.05,
              rotate: 1,
              transition: { duration: 0.2 }
            }}
          >
            <AnimatePresence mode="wait">
              {qrCodeSvg ? (
                <motion.div
                  key="qr-svg"
                  className="w-[200px] h-[200px]"
                  dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                  initial={{ opacity: 0, scale: 0.5, rotate: 180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: -180 }}
                  transition={{
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200,
                    damping: 25
                  }}
                />
              ) : (
                <motion.div
                  key="qr-fallback"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src={qrCodePath || "/popl.png"}
                    alt={`${userName}'s QR Code`}
                    width={200}
                    height={200}
                    style={{
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      if (!imageError) {
                        setImageError(true);
                        const target = e.target as HTMLImageElement;
                        target.src = "/popl.png";
                      }
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Custom Color Picker */}
          <AnimatePresence>
            {shouldShowColorPicker && (
              <motion.div
                className="mb-4 p-4 border rounded-lg bg-gray-50"
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <motion.label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Custom Color
                </motion.label>
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.input
                    type="color"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />
                  <motion.input
                    type="text"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    placeholder="#000000"
                    className="px-3 py-1 border border-gray-300 rounded text-sm font-mono"
                    whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Download Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.button
              onClick={downloadQrCode}
              className="bg-black text-white hover:bg-black/90 flex items-center gap-2 rounded-full px-6 py-2 transition-all duration-300"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Download size={16} />
              </motion.div>
              Download QR Code
            </motion.button>
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
}