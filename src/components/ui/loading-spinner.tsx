"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "#3B82F6",
  text = "Loading...",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Animated spinner */}
      <motion.div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-transparent rounded-full`}
        style={{ borderTopColor: color }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Animated text */}
      <motion.div
        className={`${textSizeClasses[size]} font-medium text-gray-600`}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.div>
      
      {/* Animated dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ 
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Alternatif pulse loading komponenti
export const PulseLoader: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "#3B82F6",
  text = "Loading...",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      <div className="relative">
        {/* Outer pulse ring */}
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-4 border-opacity-20 absolute`}
          style={{ borderColor: color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Inner circle */}
        <motion.div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center`}
          style={{ backgroundColor: `${color}20` }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
      
      <motion.p
        className="text-gray-600 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {text}
      </motion.p>
    </div>
  );
};

// Skeleton loader için tema sayfası
export const ThemePageSkeleton: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
          <div className="flex-1 h-6 bg-gray-300 rounded"></div>
          <div className="w-20 h-8 bg-gray-300 rounded"></div>
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="flex-1 flex">
        {/* Sidebar skeleton */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-4">
          <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
          <div className="space-y-2 mt-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Preview skeleton */}
        <div className="flex-1 bg-gray-100 p-8">
          <div className="max-w-sm mx-auto bg-white rounded-2xl p-6 space-y-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
            <div className="space-y-2 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
