"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Palette, 
  Sparkles, 
  Zap, 
  Eye,
  Scan
} from "lucide-react";

interface QrCodeShowcaseProps {
  userId: string;
  userName: string;
  qrCodeSvg: string;
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function QrCodeShowcase({ 
  userId, 
  userName, 
  qrCodeSvg, 
  selectedColor, 
  onColorChange 
}: QrCodeShowcaseProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [currentEffect, setCurrentEffect] = useState(0);
  const controls = useAnimation();

  const effects = [
    { name: "Pulse", icon: Zap },
    { name: "Glow", icon: Sparkles },
    { name: "Scan", icon: Scan },
    { name: "Float", icon: Eye }
  ];

  const colorVariants = [
    { name: "Gradient Blue", colors: ["#3b82f6", "#1e40af", "#1d4ed8"] },
    { name: "Gradient Purple", colors: ["#a855f7", "#7c3aed", "#6d28d9"] },
    { name: "Gradient Green", colors: ["#22c55e", "#16a34a", "#15803d"] },
    { name: "Gradient Orange", colors: ["#f97316", "#ea580c", "#dc2626"] }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEffect((prev) => (prev + 1) % effects.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [effects.length]);

  const handleScanAnimation = async () => {
    setIsScanning(true);
    await controls.start({
      scale: [1, 1.1, 1],
      rotate: [0, 360],
      transition: { duration: 1.5, ease: "easeInOut" }
    });
    setIsScanning(false);
  };

  const getEffectAnimation = () => {
    switch (currentEffect) {
      case 0: // Pulse
        return {
          scale: [1, 1.05, 1],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        };
      case 1: // Glow
        return {
          boxShadow: [
            "0 0 20px rgba(59, 130, 246, 0.5)",
            "0 0 40px rgba(59, 130, 246, 0.8)",
            "0 0 20px rgba(59, 130, 246, 0.5)"
          ],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        };
      case 2: // Scan
        return {
          background: [
            "linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.3) 50%, transparent 100%)",
            "linear-gradient(90deg, transparent 100%, rgba(34, 197, 94, 0.3) 150%, transparent 200%)"
          ],
          transition: { duration: 2, repeat: Infinity, ease: "linear" }
        };
      case 3: // Float
        return {
          y: [0, -10, 0],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Card className="p-8 bg-gradient-to-br from-white to-gray-50 shadow-2xl border-0">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            QR Code Showcase
          </h2>
          <p className="text-gray-600">Enhanced with beautiful animations</p>
        </motion.div>

        {/* QR Code Display */}
        <motion.div
          className="relative flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <motion.div
            className="relative p-6 bg-white rounded-3xl shadow-lg border-2 border-gray-100"
            animate={controls}
            whileHover={{ scale: 1.02 }}
          >
            {/* Animated Background Effects */}
            <motion.div
              className="absolute inset-0 rounded-3xl opacity-20"
              animate={getEffectAnimation()}
            />
            
            {/* Scanning Line Effect */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-50"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  exit={{ x: "200%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              )}
            </AnimatePresence>

            {/* QR Code */}
            <motion.div
              className="w-64 h-64 flex items-center justify-center relative z-10"
              animate={getEffectAnimation()}
            >
              {qrCodeSvg ? (
                <div 
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                />
              ) : (
                <motion.div
                  className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-gray-500">Loading QR Code...</span>
                </motion.div>
              )}
            </motion.div>

            {/* Corner Decorations */}
            {[0, 1, 2, 3].map((corner) => (
              <motion.div
                key={corner}
                className={`absolute w-6 h-6 border-2 border-blue-500 ${
                  corner === 0 ? "top-2 left-2 border-r-0 border-b-0" :
                  corner === 1 ? "top-2 right-2 border-l-0 border-b-0" :
                  corner === 2 ? "bottom-2 left-2 border-r-0 border-t-0" :
                  "bottom-2 right-2 border-l-0 border-t-0"
                }`}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: corner * 0.5
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Effect Controls */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Animation Effects
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {effects.map((effect, index) => {
              const Icon = effect.icon;
              return (
                <motion.button
                  key={effect.name}
                  onClick={() => setCurrentEffect(index)}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                    currentEffect === index
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{effect.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            onClick={handleScanAnimation}
            disabled={isScanning}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
              isScanning
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl"
            }`}
            whileHover={!isScanning ? { scale: 1.05 } : {}}
            whileTap={!isScanning ? { scale: 0.95 } : {}}
          >
            <Scan className="w-5 h-5" />
            {isScanning ? "Scanning..." : "Test Scan"}
          </motion.button>

          <motion.button
            className="px-6 py-3 rounded-full font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-5 h-5" />
            Download
          </motion.button>
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
