"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

import {
  ArrowLeft,
  X,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  ExternalLink,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

interface LinkEditingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  currentEditingLink: string | null;
  linkImages: Record<string, string>;
  linkUsername: string;
  setLinkUsername: (value: string) => void;
  linkTitle: string;
  setLinkTitle: (value: string) => void;
  member: any; // Replace with proper type
  onSave: () => void;
}

export function LinkEditingDialog({
  isOpen,
  onClose,
  onBack,
  currentEditingLink,
  linkImages,
  linkUsername,
  setLinkUsername,
  linkTitle,
  setLinkTitle,
  member,
  onSave,
}: LinkEditingDialogProps) {  // Define animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };return (    <Dialog open={isOpen} onOpenChange={onClose}>  
      <DialogContent className="p-6 pt-12" aria-describedby="link-editing-description">
        {/* DialogTitle eklendi ama CSS ile görsel olarak gizlendi */}
        <DialogHeader className="sr-only">
          <DialogTitle>Edit Link</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-0 top-0"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Back</span>
          </Button>
          
          <div className="text-center w-full mb-4">
            <h2 className="font-medium">Edit Link</h2>
          </div>
        </div>
        
        <motion.div
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div className="space-y-4" variants={itemVariants}>            <motion.div className="flex items-center justify-center mb-6" variants={itemVariants}>
              {currentEditingLink && (
                <motion.div 
                  className="h-16 w-16 flex items-center justify-center bg-blue-100 rounded-md"
                  initial={{ scale: 0.8, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 10 
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                    transition: { duration: 0.2 } 
                  }}
                >
                  {/* Simple consolidated icon handler */}
                  {currentEditingLink && (
                    <Image
                      className="h-12 w-12 object-contain"
                      src={linkImages[currentEditingLink as keyof typeof linkImages] || `/links/${currentEditingLink}.svg`}
                      alt={`${currentEditingLink.charAt(0).toUpperCase() + currentEditingLink.slice(1)} Icon`}
                      height={48}
                      width={48}
                      onError={(e) => {
                        // Fallback to a generic icon if the image fails to load
                        e.currentTarget.src = "/links/customlink.svg";
                      }}
                    />
                  )}
                </motion.div>
              )}
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <label className="text-sm font-medium" htmlFor="username">
                {currentEditingLink === "instagram" && "Instagram username*"}
                {currentEditingLink === "linkedin" && "LinkedIn username*"}
                {currentEditingLink === "website" && "Website URL*"}
                {currentEditingLink === "discord" && "Discord username*"}
                {currentEditingLink === "facetime" && "FaceTime contact*"}
                {currentEditingLink === "calendly" && "Calendly link*"}
                {currentEditingLink === "contact" && "Contact email*"}
                {currentEditingLink === "email" && "Email address*"}
                {currentEditingLink === "text" && "Phone number*"}
                {currentEditingLink === "call" && "Phone number*"}
                {currentEditingLink === "address" && "Address*"}
                {currentEditingLink === "whatsapp" && "WhatsApp number*"}
              </label>              <motion.input
                whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.25)" }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                id="username"
                className="w-full px-3 py-2 rounded-md bg-[#F7F7F7] text-sm focus:outline-none border border-gray-200"
                placeholder={
                  currentEditingLink === "instagram"
                    ? "@yourusername"
                    : currentEditingLink === "linkedin"
                      ? "linkedin.com/in/username"
                      : currentEditingLink === "website"
                        ? "https://example.com"
                        : currentEditingLink === "discord"
                          ? "username#1234"
                          : currentEditingLink === "facetime"
                            ? "+1234567890 or email"
                            : currentEditingLink === "calendly"
                              ? "calendly.com/username"
                              : currentEditingLink === "contact"
                                ? "contact@example.com"
                                : currentEditingLink === "email"
                                  ? "email@example.com"
                                  : currentEditingLink === "text"
                                    ? "+1234567890"
                                    : currentEditingLink === "call"
                                      ? "+1234567890"
                                      : currentEditingLink === "address"
                                        ? "123 Main St, City"
                                        : "+1234567890"
                }
                value={linkUsername}
                onChange={(e) => setLinkUsername(e.target.value)}
              />
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <label className="text-sm font-medium" htmlFor="title">
                Link title
              </label>              <motion.input
                whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.25)" }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                id="title"
                className="w-full px-3 py-2 rounded-md bg-[#F7F7F7] text-sm focus:outline-none border border-gray-200"
                placeholder={
                  currentEditingLink === "instagram" ? "Instagram" : "My Link"
                }
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
              />
            </motion.div>

            {(currentEditingLink === "website" ||
              currentEditingLink === "calendly") && (
              <motion.div 
                className="space-y-2"
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center">
                  <label className="text-sm font-medium flex-1">
                    Test your link
                  </label>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </motion.div>
            )}
              {/* Action buttons */}
            <motion.div className="flex items-center gap-3 mt-4" variants={itemVariants}>              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="w-full rounded-full border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button 
                  onClick={onSave}
                  className="w-full bg-black hover:bg-black/90 text-white rounded-full"
                  disabled={!linkUsername}
                >
                  <motion.span
                    initial={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <span>Add link</span>
                    {linkUsername ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                    ) : null}
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div className="flex flex-col items-center justify-center h-full" variants={itemVariants}>
            <div className="text-xs flex flex-col space-y-5 text-center">
              <p className="text-[#828282] font-semibold">Link Preview</p>
            </div>
            <motion.div
              className="w-full max-w-[260px] h-[520px] flex flex-col rounded-[25px] mt-4 border overflow-hidden border-[rgb(189,189,189)]"
              style={{
                backgroundColor: "#BFDBFE", // Default blue background
                fontFamily: "Inter", // Default font
              }}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25 
              }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Header with gradient background and profile picture */}
              <div className="h-28 w-full flex justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600" />
                <motion.div 
                  className="w-20 h-20 absolute bg-white p-1 rounded-full -bottom-10"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={member?.profilePicture || "/defaultpp.png"}
                      className="rounded-full object-cover w-full h-full"
                      alt="Profile"
                      width={80}
                      height={80}
                    />
                    {/* Company logo badge */}
                    <motion.div 
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white p-0.5 border border-white shadow-md"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Image
                        src="/company_logo.png"
                        alt="Company"
                        className="object-contain rounded-full w-full h-full"
                        width={24}
                        height={24}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Content section */}
              <div className="mt-12 px-5 flex flex-col items-center text-center">
                <motion.h3 
                  className="font-bold text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {member?.name || "User Name"}
                </motion.h3>
                <motion.p 
                  className="text-xs mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {member?.jobTitle || "Job Title"} at{" "}
                  {member?.company || "Company"}
                </motion.p>
                <motion.p 
                  className="text-xs mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {member?.location || "Location"}
                </motion.p>

                <motion.div 
                  className="mt-4 w-full px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <p className="text-[9px] font-medium leading-relaxed">
                    {member?.bio || "User bio information would appear here."}
                  </p>
                </motion.div>

                {/* Contact button */}
                <motion.button                  className="w-full text-white py-2 rounded-full text-sm font-medium mt-4"
                  style={{
                    backgroundColor: "#3B82F6", // Default blue button
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ backgroundColor: "#2563EB" }}
                >
                  Save Contact
                </motion.button>

                {/* The currently editing link in vertical format */}
                <motion.div 
                  className="flex flex-col space-y-2 mt-3 w-full px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="flex items-center w-full p-2 rounded-md bg-white/10"
                    whileHover={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className="w-8 h-8 rounded-md flex items-center justify-center mr-2 bg-blue-500">
                      {/* Use the linkImages for all icons */}
                      {currentEditingLink && (
                        <Image
                          src={linkImages[currentEditingLink as keyof typeof linkImages] || `/links/${currentEditingLink}.svg`}
                          alt={currentEditingLink}
                          className="h-5 w-5"
                          width={20}
                          height={20}
                        />
                      )}
                    </div>
                    <span className="text-xs font-medium">
                      {linkTitle || 
                        (currentEditingLink && currentEditingLink.length > 0 ? 
                          currentEditingLink.charAt(0).toUpperCase() + 
                          currentEditingLink.slice(1) : 
                          "Link")}
                    </span>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// Also provide a default export for compatibility
export default LinkEditingDialog;
