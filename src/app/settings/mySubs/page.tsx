"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Mail, ArrowRight, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const fadeInRight = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, type: "spring", stiffness: 100 }
  },
  hover: { 
    scale: 1.02,
    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2), 0 8px 10px -6px rgba(59, 130, 246, 0.2)",
    transition: { duration: 0.3, type: "spring", stiffness: 300 }
  }
};

const featureCardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  hover: { 
    x: 5, 
    transition: { duration: 0.2 } 
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.05, 
    transition: { duration: 0.2, type: "spring", stiffness: 400 }
  },
  tap: { 
    scale: 0.95, 
    transition: { duration: 0.1 } 
  }
};

export default function mySubs() {
  return (
    <motion.div 
      className="container mx-auto p-10 py-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.h1 
        className="text-2xl font-semibold mb-6"
        variants={fadeInUp}
      >
        My Subscription
      </motion.h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Plan Information Card */}
        <motion.div 
          className="lg:col-span-2"
          variants={cardVariants}
          whileHover="hover"
        >
          <Card className="shadow-md border-0 overflow-hidden">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="text-lg font-medium text-gray-800 flex items-center">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                Plan Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Current Plan Tier */}
                <motion.div 
                  className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
                  variants={fadeInUp}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <p className="text-sm text-blue-600 font-medium mb-2">Current Plan Tier</p>
                  <p className="text-lg font-semibold text-gray-900">Business Tier</p>
                </motion.div>
                
                {/* Plan Type */}
                <motion.div 
                  className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
                  variants={fadeInUp}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <p className="text-sm text-blue-600 font-medium mb-2">Plan Type</p>
                  <p className="text-lg font-semibold text-gray-900">Multiyear</p>
                </motion.div>
                
                {/* Number Monthly */}
                <motion.div 
                  className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
                  variants={fadeInUp}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <p className="text-sm text-blue-600 font-medium mb-2">Number Monthly</p>
                  <p className="text-lg font-semibold text-gray-900">5</p>
                </motion.div>
                
                {/* Next Bill Date */}
                <motion.div 
                  className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
                  variants={fadeInUp}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <p className="text-sm text-blue-600 font-medium mb-2">Next Bill Date</p>
                  <p className="text-lg font-semibold text-gray-900">Jul 10, 2024</p>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Price Card */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
        >
          <Card className="bg-gradient-to-br h-full from-blue-50 to-blue-100 shadow-md border-0">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <motion.div 
                className="text-center mb-4"
                variants={fadeInRight}
              >
                <motion.p 
                  className="text-3xl font-bold text-gray-900"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >$420.00 USD</motion.p>
                <motion.p 
                  className="text-sm text-gray-600 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >Billed yearly</motion.p>
                <motion.p 
                  className="text-sm mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >Yearly price per member: <span className="font-semibold">$84.00</span></motion.p>
              </motion.div>
              
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
                className="w-full"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 shadow-sm flex items-center justify-center gap-2">
                  <motion.div
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <CreditCard className="h-4 w-4" />
                  </motion.div>
                  Manage Billing
                </Button>
              </motion.div>
              
              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <p className="text-sm text-gray-600">
                  Have more questions about your plan? <motion.a 
                    href="#" 
                    className="text-blue-600 hover:underline"
                    whileHover={{ scale: 1.05, color: "#2563EB" }}
                  >Contact us here</motion.a>.
                </p>
                <div className="flex items-center justify-center mt-5">
                  <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                  >
                    <Button 
                      variant="outline"
                      className="rounded-full bg-gradient-to-r from-teal-400 to-teal-500 text-white border-none shadow-md px-5 py-1 flex items-center gap-2 hover:shadow-lg transition-shadow"
                    >
                      <motion.div
                        initial={{ y: 0 }}
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </motion.div>
                      <span>Contact Us</span>
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Features Section */}
      <motion.div
        variants={featureCardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="shadow-md border-0 mb-8">
          <CardHeader className="pb-2 py-3 bg-gradient-to-r rounded-lg from-lime-50 to-teal-100 border-b border-gray-100">
            <CardTitle className="text-lg font-medium text-gray-800 flex items-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              {"What's included?"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 mt-4 gap-y-3">
              {[
                "Conference Badge Scanner", 
                "Paid Plan For All Members", 
                "Business Card Scanner", 
                "Schedule Locking", 
                "Lead Approval",
                "Advanced Analytics",
                "CRM Integration",
                "Admin Approvals",
                "Auto Tagging Lead Campaign",
                "Dedicated Support",
                "Subteams",
                "Custom Email Follow-up's",
                "Templates",
                "Popl AI",
                "Microsoft AD Sync"
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-2 group cursor-default"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <motion.div 
                    className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center"
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 10 }}
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </motion.div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
