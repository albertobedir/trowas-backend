"use client";

import React from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

// Link Card Component for the Add Link Modal
export const LinkCard = ({ 
  icon, 
  name, 
  color = "bg-gray-100",
  onClick 
}: { 
  icon: React.ReactNode; 
  name: string; 
  color?: string;
  onClick: () => void;
}) => {
  // Enhanced card animations for better UX
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: "spring" } },
    hover: { 
      scale: 1.03, 
      backgroundColor: "rgba(249, 250, 251, 1)", 
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
      transition: { type: "spring", stiffness: 400, damping: 17 }
    },
    tap: { scale: 0.97 }
  };

  const iconContainerVariants = {
    initial: {},
    hover: { scale: 1.1, transition: { type: "spring", stiffness: 500 } }
  };

  const plusIconVariants = {
    initial: {},
    hover: { rotate: 90, scale: 1.2, transition: { duration: 0.3 } }
  };

  return (
    <motion.button 
      className="flex items-center justify-between w-full p-3 rounded-xl border border-gray-100"
      onClick={onClick}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
    >
      <div className="flex items-center space-x-3">
        <motion.div 
          className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center`}
          variants={iconContainerVariants}
        >
          <motion.div 
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {icon}
          </motion.div>
        </motion.div>
        <motion.span 
          className="text-sm font-medium"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {name}
        </motion.span>
      </div>
      <motion.div variants={plusIconVariants}>
        <Plus className="h-4 w-4 text-gray-400" />
      </motion.div>
    </motion.button>
  );
};
