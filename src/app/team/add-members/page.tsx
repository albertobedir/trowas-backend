"use client";

import { useState, KeyboardEvent, useRef, ChangeEvent, useEffect } from "react";
import { PiCreditCardLight, PiCreditCardBold } from "react-icons/pi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "postcss";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/user-store";
import { Api } from "@/lib/api";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function TeamAddMembersPage() {
  const { user, fetchUser } = useUserStore();
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("email");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [companyPagesCount, setCompanyPagesCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

    const [notification, setNotification] = useState<{
      visible: boolean;
      message: string;
      type: "success" | "error";
    }>({
      visible: false,
      message: "",
      type: "success",
    });
  
    // Function to show notification
    const showNotification = (
      message: string,
      type: "success" | "error" = "success"
    ) => {
      setNotification({
        visible: true,
        message,
        type,
      });
  
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, visible: false }));
      }, 3000);
    };

  // Simple email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  const handleAddEmail = () => {
    if (email.trim() && isValidEmail(email.trim()) && !invites.includes(email.trim())) {
      setInvites([...invites, email.trim()]);
      setEmail("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent new line on Enter or Space
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      
      // Only add if it's a valid email
      if (isValidEmail(email.trim())) {
        handleAddEmail();
      } else if (e.key === " ") {
        // If not a valid email but Space was pressed, add a space
        setEmail(prev => prev + " ");
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEmail(e.target.value);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setInvites(invites.filter(e => e !== emailToRemove));
  };

  const handleSendInvites = async () => {
    if (!user?.team || invites.length === 0) return;

    try {
      const response = await Api.post(`teams/${user.team}/members/add`, {
        emails: invites
      });

      if (response.status === 200) {
        
        setInvites([]);
        showNotification(`${invites.length} user(s) were invited successfully`, "success");
      }
    } catch (error) {
      console.error('Failed to send invites:', error);
      showNotification("Failed to send invites", "error");
      // You might want to show an error notification here
    }
  };
    const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'csv' && fileExtension !== 'xls' && fileExtension !== 'xlsx') {
      toast.error('Please upload a CSV or Excel file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await Api.post(`/teams/${user?.team}/members/add/csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        toast.success('File uploaded successfully');
        // Handle the response data as needed
      } else {
        toast.error('Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    }
  };
  const handleCompanyPagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    setCompanyPagesCount(value);
  };

  const handleAddPages = async () => {
    if (!companyPagesCount || companyPagesCount <= 0) return;
    
    setIsLoading(true);
    try {
      const response = await Api.post('/company/add-company', {
        count: companyPagesCount
      });
      
      if (response.data.success) {
        showNotification(`Successfully added ${companyPagesCount} company page${companyPagesCount !== 1 ? 's' : ''}`, "success");
        // Reset the input after successful addition
        setCompanyPagesCount(null);
      }
    } catch (error) {
      showNotification('Failed to add company pages. Please try again.', "error");
      console.error('Error adding company pages:', error);
    } finally {
      setIsLoading(false);
    }
  };



  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const notificationVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.9,
      transition: { 
        duration: 0.2 
      }
    }
  };

  const tabTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3
  };

  return (
    <motion.div 
      className="p-4 w-full h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <h1 className="text-2xl font-medium">Add Member</h1>
      </motion.div>

      <Card className="flex overflow-hidden border-0 shadow-md flex-1 w-full">
        {/* Sol Sidebar - Genişliği 180px ve stillemesi sidebar-nav ile uyumlu */}
        <motion.div 
          className="w-[180px] bg-sidebar border-r border-sidebar-border/50 h-full"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="py-2 px-2 space-y-1.5">
            {["email", "csv", "company", "directory", "eventbrite"].map((tab, index) => (
              <motion.button 
                key={tab}
                className={`w-full text-left px-3 py-1.5 text-[11.5px] font-medium transition-all duration-200 ease-in-out rounded-md
                  ${activeTab === tab ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold' : 'text-gray-600 hover:bg-sidebar-accent/50'}`}
                onClick={() => setActiveTab(tab)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab === "email" && "Add by Email"}
                {tab === "csv" && "Import via CSV"}
                {tab === "company" && "Add Company Pages"}
                {tab === "directory" && "Sync Active Directory"}
                {tab === "eventbrite" && "Sync Eventbrite"}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Sağ İçerik Alanı */}
        <motion.div 
          className="flex-1 flex flex-col h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {notification.visible && (
                  <div
                    className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-md shadow-lg ${
                      notification.type === "success" ? "bg-green-600" : "bg-red-600"
                    } text-white font-medium transition-all duration-500 transform translate-y-0 opacity-100`}
                  >
                    {notification.type === "success" ? (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>{notification.message}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4" />
                        <span>{notification.message}</span>
                      </div>
                    )}
                  </div>
                )}
          <AnimatePresence mode="wait">
            {activeTab === "email" && (
              <motion.div 
                key="email"
                className="w-[60%] p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={tabTransition}
              >
                <div className="flex flex-col h-full">
                  {/* Üst Bölüm - Başlık ve Açıklama */}
                  <motion.div 
                    className="pt-6 pl-6 space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.h2 variants={itemVariants} className="text-xl font-medium mb-2">
                      Invite Teammates
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-sm text-gray-500">
                      Add members to your team via email. If a Popl user with that email already exists, the member will be pending until the user accepts the email invite.
                    </motion.p>
                  </motion.div>
                
                  {/* Orta Bölüm - E-posta ekleme alanı ve liste */}
                  <motion.div 
                    className="pl-6 pt-8 bg-white flex-grow overflow-auto"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                  >
                    <div className="mb-6">
                      <div className="flex flex-col gap-3">
                        <motion.div 
                          className="flex-1 min-h-24 bg-[#F7F7F7] p-3 rounded-md flex flex-wrap gap-2 items-start"
                          variants={itemVariants}
                        >
                          <AnimatePresence>
                            {invites.map((invite, index) => (
                              <motion.div 
                                key={invite}
                                className="inline-flex items-center bg-[rgb(224,224,224)] px-4 py-1 rounded-full text-sm"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.3 }}
                                layout
                              >
                                {invite}
                                <motion.button 
                                  onClick={() => handleRemoveEmail(invite)}
                                  className="ml-2 text-gray-500 border border-black rounded-full hover:text-gray-700"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <X size={14} />
                                </motion.button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          <textarea
                            ref={textareaRef}
                            placeholder="Enter emails separated by commas"
                            value={email}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onBlur={() => email.trim() && isValidEmail(email.trim()) && handleAddEmail()}
                            className="flex-grow border-0 bg-transparent focus:outline-none focus:ring-0 p-0 h-6 min-h-6 max-h-6 shadow-none align-top resize-none overflow-hidden"
                            style={{ 
                              verticalAlign: 'top',
                              minWidth: '100px'
                            }}
                          />
                        </motion.div>
                        
                        <AnimatePresence>
                          {invites.length > 0 && (
                            <motion.div 
                              className="bg-[rgba(41,174,248,0.1)] justify-between font-semibold text-xs text-black/90 px-6 h-12 items-center flex py-2 rounded-xl"
                              variants={notificationVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              layout
                            >
                              <div className="flex items-center gap-2">
                                <PiCreditCardBold className="fill-[#29AEF8] h-5 w-5" />
                                Adding {invites.length} member{invites.length !== 1 ? 's' : ''}
                              </div>
                              <div>
                                This will influence your monthly payment
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>

                  {/* Alt Bölüm - Butonlar */}
                  <motion.div 
                    className="flex justify-between gap-3 pl-6 bg-white mt-auto"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                  >
                    

                    <motion.div variants={itemVariants}>
                      <Button 
                        onClick={handleSendInvites}
                        disabled={invites.length === 0}
                        className="bg-[#212121] h-8 px-9 rounded-full hover:bg-[#212121]/90 text-white"
                      >
                        Add Teammates
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab !== "email" && (
              <motion.div 
                key={activeTab}
                className="p-6 h-full flex flex-col"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={tabTransition}
              >
                {activeTab === "csv" && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.h3 variants={itemVariants} className="text-lg font-medium mb-4">
                      Import via CSV
                    </motion.h3>
                    <motion.p variants={itemVariants} className="text-gray-600 mb-4">
                      Upload a CSV file to add multiple members at once.
                    </motion.p>
                    <motion.div 
                      variants={itemVariants}
                      className="p-8 border-2 border-dashed rounded-md text-center flex-grow flex flex-col items-center justify-center relative"
                      whileHover={{ scale: 1.02, borderColor: "#000" }}
                    >
                      <input
                        type="file"
                        accept=".csv,.xls,.xlsx"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Upload CSV or Excel file"
                      />
                      <p className="text-gray-500">Drag and drop a CSV or XLS file here or click to browse</p>
                      <p className="text-gray-400 text-sm mt-2">Supported formats: CSV, XLS, XLSX</p>
                    </motion.div>
                  </motion.div>
                )}

                {activeTab === "company" && (
                  <motion.div 
                    className="flex flex-col text-black/90 p-6 gap-4 w-[65%]"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.p variants={itemVariants} className="text-[16px] font-medium pb-4">
                      Add Company Pages
                    </motion.p>
                    <motion.p variants={itemVariants} className="text-sm font-normal">
                      Create company pages if you want to share information that is NOT associated with a team member.
                    </motion.p>
                    <motion.p variants={itemVariants} className="text-sm font-normal">
                      For example, if you want to share information about your company from your conference booth, you could use a company page to do this. Any team member that is sharing a profile with information about themselves should be added via email invite, csv upload or AD sync.
                    </motion.p>
                    <motion.div 
                      className="flex flex-col gap-3 pt-8"
                      variants={itemVariants}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <motion.input 
                          className="flex-grow border-0 bg-[#F7F7F7] focus:outline-none focus:ring-0 p-3 min-h-10 rounded-lg shadow-none align-top resize-none overflow-hidden" 
                          type="text"
                          placeholder="Number of pages" 
                          onChange={handleCompanyPagesChange}
                          value={companyPagesCount || ''}
                          style={{ appearance: 'textfield' }}
                          whileFocus={{ boxShadow: "0 0 0 2px rgba(41,174,248,0.3)" }}
                        />
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            className="w-44 h-8 bg-black rounded-full"
                            onClick={handleAddPages}
                            disabled={isLoading || !companyPagesCount || companyPagesCount <= 0}
                          >
                            {isLoading ? 'Adding...' : 'Add Pages'}
                          </Button>
                        </motion.div>
                      </div>
                      
                      <AnimatePresence>
                        {companyPagesCount && companyPagesCount > 0 && (
                          <motion.div 
                            className="bg-[rgba(41,174,248,0.1)] justify-between font-semibold text-xs text-black/90 px-6 h-12 items-center flex py-2 rounded-xl"
                            variants={notificationVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <div className="flex items-center gap-2">
                              <PiCreditCardBold className="fill-[#29AEF8] h-5 w-5" />
                              Adding {companyPagesCount} page{companyPagesCount !== 1 ? 's' : ''}
                            </div>
                            <div>
                              This will influence your monthly payment
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )}

                {activeTab === "directory" && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.h3 variants={itemVariants} className="text-lg font-medium mb-4">
                      Sync with Active Directory
                    </motion.h3>
                    <motion.div variants={itemVariants}>
                      <Card className="p-6 bg-white h-64 w-[342px] rounded-md shadow-lg">
                        <motion.div 
                          className="flex flex-col text-center justify-center items-center gap-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        >
                          <motion.div 
                            className="bg-[#F7F7F7] w-20 flex items-center justify-center h-20 p-2 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                          >
                            <motion.img 
                              className="w-12 h-12" 
                              src="/azure.png" 
                              alt="Azure Active Directory"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.4, type: "spring" }}
                            />
                          </motion.div>
                          <motion.div 
                            className="space-y-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                          >
                            <p className="text-black/90 font-semibold text-lg">Active Directory</p>
                            <p className="text-xs font-medium text-[#4F4F4F]">Full platform of marketing, sales, customer service, and CRM software.</p>
                          </motion.div>
                          <motion.div 
                            className="flex items-center gap-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.3 }}
                          >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button className="bg-white border border-[#F7F7F7] h-8 px-7 rounded-full hover:bg-[#F7F7F7]/90 text-black">
                                Configure
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button className="bg-[#212121] h-8 px-7 rounded-full hover:bg-[#212121]/90 text-white">
                                Start Setup
                              </Button>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </Card>
                    </motion.div>
                  </motion.div>
                )}

                {activeTab === "eventbrite" && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.h3 variants={itemVariants} className="text-lg font-medium mb-4">
                      Sync with Eventbrite
                    </motion.h3>
                    <motion.div variants={itemVariants}>
                      <Card className="p-6 bg-white h-64 w-[342px] rounded-md shadow-lg">
                        <motion.div 
                          className="flex flex-col text-center justify-center items-center gap-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        >
                          <motion.div 
                            className="bg-[#F7F7F7] w-20 flex items-center justify-center h-20 p-2 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                          >
                            <motion.img 
                              className="w-12 h-12" 
                              src="/eventbrite.png" 
                              alt="Eventbrite"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.4, type: "spring" }}
                            />
                          </motion.div>
                          <motion.div 
                            className="space-y-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                          >
                            <p className="text-black/90 font-semibold text-lg">Eventbrite</p>
                            <p className="text-xs font-medium text-[#4F4F4F]">Sync attendees from Eventbrite to Popl for QR code and badge management.</p>
                          </motion.div>
                          <motion.div 
                            className="flex items-center gap-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.3 }}
                          >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button className="bg-white border border-[#F7F7F7] h-8 px-7 rounded-full hover:bg-[#F7F7F7]/90 text-black">
                                Configure
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button className="bg-[#212121] h-8 px-7 rounded-full hover:bg-[#212121]/90 text-white">
                                Start Setup
                              </Button>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </Card>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Card>
    </motion.div>
  );
}