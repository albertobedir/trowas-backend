"use client";

import React from "react";
import { motion } from "framer-motion";

export function QrCodeLoadingAnimation() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* QR Code Grid Animation */}
      <motion.div
        className="relative w-32 h-32 mb-6"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Grid Squares */}
        <div className="grid grid-cols-8 gap-1">
          {[...Array(64)].map((_, index) => {
            const shouldShow = [
              0, 1, 2, 3, 4, 5, 6,
              8, 14,
              16, 18, 20, 22,
              24, 30,
              32, 38,
              40, 46,
              48, 54,
              56, 57, 58, 59, 60, 61, 62,
              // Additional pattern squares
              9, 11, 13, 17, 19, 21, 25, 27, 29, 33, 35, 37,
              41, 43, 45, 49, 51, 53
            ].includes(index);

            return (
              <motion.div
                key={index}
                className={`w-3 h-3 rounded-sm ${
                  shouldShow ? "bg-black" : "bg-transparent"
                }`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: shouldShow ? 1 : 0,
                  opacity: shouldShow ? 1 : 0
                }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.02,
                  ease: "easeOut"
                }}
              />
            );
          })}
        </div>

        {/* Scanning Line */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"
          animate={{
            x: [-40, 168]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Corner Markers */}
        {[
          { top: 0, left: 0 },
          { top: 0, right: 0 },
          { bottom: 0, left: 0 }
        ].map((position, index) => (
          <motion.div
            key={index}
            className="absolute w-6 h-6 border-2 border-black"
            style={position}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.5 + index * 0.2,
              type: "spring",
              stiffness: 200
            }}
          >
            <div className="w-2 h-2 bg-black m-1" />
          </motion.div>
        ))}
      </motion.div>

      {/* Loading Text */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <motion.h3
          className="text-lg font-semibold text-gray-800 mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Generating QR Code
        </motion.h3>
        
        {/* Dots Animation */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function QrCodeSuccessAnimation() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
    >
      {/* Success Checkmark */}
      <motion.div
        className="relative w-20 h-20 mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: 0.6, 
          type: "spring", 
          stiffness: 200 
        }}
      >
        <motion.div
          className="w-full h-full rounded-full bg-green-500 flex items-center justify-center"
          initial={{ rotate: -180 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.svg
            className="w-10 h-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.div>

        {/* Success Ripple Effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-green-500"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </motion.div>

      <motion.h3
        className="text-xl font-semibold text-green-600 mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        QR Code Generated!
      </motion.h3>
      
      <motion.p
        className="text-gray-600 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        Your QR code is ready to download
      </motion.p>
    </motion.div>
  );
}
