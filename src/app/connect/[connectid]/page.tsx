"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useParams, useRouter, useSearchParams } from "next/navigation";
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link as LinkIcon,
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  ExternalLink,
  FileText,
  MessageSquare,
  X,
  ChevronDown
} from 'lucide-react';
import { Api } from '@/lib/api';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MdCall, MdEmail, MdSave } from 'react-icons/md';

interface EmailData {
  to: string[];
  subject: string;
  message: string;
  sendAfterHour: string;
  sendAfterMinute: string;
  isActive: boolean;
}
// Define the types for card data
interface UserCard {
  id: string;
  name: string;
  username: string;
  cardName: string;
  location: string;
  jobTitle: string;
  call: string;
  email: string;
  company: string;
  bio: string;
  profilePicture: string;
  coverPhoto: string;
  companyLogo: string;
  cardTheme: string;
  linkColor: string;
  font: string;
  layout?: string;
  cardLayout?: string; // Added cardLayout field to support both properties
  emailData?: EmailData;
  links: {
    links?: {
      linkOrder: string[];
      activeLinks: Record<string, boolean>;
      userLinks: Record<string, UserLink>;
    }
  },
  leadCaptureFields?: Array<{
    id: number;
    name: string;
    required: boolean;
    type: string;
    options?: string[];
  }>;
  leadCaptureSettings?: {
    isEnabled: boolean;
    formHeader: string;
    connectButtonText: string;
    formDisclaimer: string;
  };
  leadForm?: {
    fields: Array<{
      id: number;
      name: string;
      required: boolean;
      type: string;
      options?: string[];
    }>;
    formHeader: string;
    connectButtonText: string;
    formDisclaimer: string;
    settings?: {
      isEnabled: boolean;
      formHeader: string;
      connectButtonText: string;
      formDisclaimer: string;
    };
    hiddenFields?: Array<{
      id: number;
      title: string;
      value: string;
    }>;
  };
}

interface UserLink {
  type: string;
  username: string;
  title: string;
  url?: string;
}

// Define file upload response type
interface FileUploadInfo {
  path: string;
  filename: string;
}

// Lead Capture Form component
const LeadCaptureForm = ({
  card,
  isOpen,
  onClose,
  connectId
}: {
  card: UserCard;
  isOpen: boolean;
  onClose: () => void;
  connectId: string;
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fileUploads, setFileUploads] = useState<Record<string, FileUploadInfo>>({});
  const [submitting, setSubmitting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lead data state
  const [leadData, setLeadData] = useState({
    fields: card.leadForm?.fields || [
      { id: 1, name: "Full Name", required: false, type: 'text' },
      { id: 2, name: "Email", required: true, type: 'text' },
      { id: 3, name: "Phone Number", required: false, type: 'text' }
    ],
    formHeader: card.leadForm?.formHeader || `Share your info back with ${card.name}`,
    connectButtonText: card.leadForm?.connectButtonText || 'Connect',
    formDisclaimer: card.leadForm?.formDisclaimer || 'Your data is private and secure'
  });

  // Component mount
  useEffect(() => {
    console.log("Card data:", card);
    console.log("Lead Form data:", card.leadForm);

    if (card.leadForm) {
      setLeadData({
        fields: card.leadForm.fields || leadData.fields,
        formHeader: card.leadForm.formHeader || leadData.formHeader,
        connectButtonText: card.leadForm.connectButtonText || leadData.connectButtonText,
        formDisclaimer: card.leadForm.formDisclaimer || leadData.formDisclaimer
      });
    }


    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [card, leadData.fields, leadData.formHeader, leadData.connectButtonText, leadData.formDisclaimer]);


  const handleInputChange = (fieldId: number, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId.toString()]: value }));
  };

  // Handle file uploads
  const handleFileUpload = async (fieldId: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', connectId);

      handleInputChange(fieldId, 'Uploading...');

      const response = await Api.post('/leads/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.path) {
        handleInputChange(fieldId, file.name);

        setFileUploads(prev => ({
          ...prev,
          [fieldId.toString()]: {
            path: response.data.path,
            filename: file.name
          }
        }));

        console.log('File uploaded successfully:', response.data.path);
      } else {
        console.error('No file path in response:', response.data);
        handleInputChange(fieldId, 'Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      handleInputChange(fieldId, 'Error uploading file');
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const missingRequiredFields = leadData.fields
        .filter(field => field.required)
        .filter(field => !formData[field.id.toString()]);

      if (missingRequiredFields.length > 0) {
        alert(`Please fill in all required fields: ${missingRequiredFields.map(f => f.name).join(', ')}`);
        setSubmitting(false);
        return;
      }

      const formDataWithLabels: Record<string, any> = {};

      leadData.fields.forEach(field => {
        const fieldId = field.id.toString();
        const fieldValue = formData[fieldId];

        if (fieldValue) {
          if (field.type === 'file' && fileUploads[fieldId]) {
            formDataWithLabels[field.name] = {
              type: 'file',
              path: fileUploads[fieldId].path,
              filename: fileUploads[fieldId].filename
            };
          } else {
            formDataWithLabels[field.name] = fieldValue;
          }
        }
      });

      const jsonFormattedData = JSON.stringify(formDataWithLabels, null, 2);

      const fullName = formDataWithLabels["Full Name"] || "";
      const poplUserName = card.name || "";
      const digitalCardUrl = window.location.href || "";

      let message = card.emailData?.message || "";
      let subject = card.emailData?.subject || "";

      // message alanında yer değişimleri
      message = message.replaceAll("{Lead's Full Name}", fullName);
      message = message.replaceAll("{Popl User's Name}", poplUserName);
      message = message.replaceAll(
        "{My Digital Business Card URL}",
        `<a href="${digitalCardUrl}">My Digital Business Card</a>`
      );

      // subject alanında yer değişimleri (link HTML olmadan düz URL olarak konur)
      subject = subject.replaceAll("{Lead's Full Name}", fullName);
      subject = subject.replaceAll("{Popl User's Name}", poplUserName);
      subject = subject.replaceAll(
        "{My Digital Business Card URL}",
        digitalCardUrl
      );

      const emailDataformated = {
        to: [card.email, formDataWithLabels["Email"]],
        subject: subject,
        message: message,
        isActive: card.emailData?.isActive,
        sendAfter:
          card.emailData?.sendAfterHour + " hour " + card.emailData?.sendAfterMinute + " minutes"
      };



      console.log("Form data as JSON:", jsonFormattedData);

      try {
        const submitData = {
          ...formData,
          cardId: card.id,
          capturedAt: new Date().toISOString(),
          formattedData: formDataWithLabels,
          fileUploads: fileUploads
        };

        const apiPayload = {
          userId: connectId,
          leadData: formDataWithLabels,
          ...(card.emailData?.isActive && { emailData: emailDataformated }) // koşullu ekleme
        };

        console.log("Sending API payload:", apiPayload);
        await Api.post(`/leads/create-lead`, apiPayload);

        console.log("Lead successfully captured");
        onClose();
      } catch (apiErr) {
        console.error("API error submitting lead:", apiErr);
        alert("Failed to submit your information. Please try again later.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDropdown = (id: number) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(id);
    }
  };

  // Create a unique ID for the Lead Capture Form dialog content
  const dialogContentId = "lead-capture-form-dialog";

  // Custom CSS to hide the default close button
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      #${dialogContentId} > button[data-radix-dialog-close] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Function to render different form field types
  const renderField = (field: {
    id: number;
    name: string;
    required: boolean;
    type: string;
    options?: string[];
  }) => {
    const isRequired = field.required;
    const fieldValue = formData[field.id.toString()] || '';
    const isInvalid = isRequired && formData[field.id.toString()] === undefined;

    const labelComponent = (
      <label className="text-sm font-medium break-words mb-1 block">
        {field.name} {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
    );

    switch (field.type) {
      case 'text':
        return (
          <div className="mb-3 p-1" key={field.id}>
            {labelComponent}
            <input
              type="text"
              className={`w-full px-4 py-3 border ${isInvalid ? 'border-red-300' : 'border-gray-200'} rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              style={{
                borderColor: isInvalid ? 'red' : undefined,
                outlineColor: card.linkColor === "transparent" ? "#3B82F6" : card.linkColor
              }}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              value={fieldValue}
              required={isRequired}
              placeholder={`Enter ${field.name.toLowerCase()}`}
            />
            {isInvalid && <p className="text-xs text-red-500 mt-1">This field is required</p>}
          </div>
        );
      case 'dropdown':
        return (
          <div className="mb-3 relative" key={field.id}>
            {labelComponent}
            <div
              className={`w-full px-4 py-3 border ${isInvalid ? 'border-red-300' : 'border-gray-200'} rounded-lg text-base flex items-center justify-between cursor-pointer bg-white`}
              onClick={() => toggleDropdown(field.id)}
              style={{
                borderColor: isInvalid ? 'red' : undefined,
              }}
            >
              <span className={`${!fieldValue ? 'text-gray-400' : ''} truncate`}>
                {fieldValue || 'Select an option'}
              </span>
              <ChevronDown className="h-5 w-5 flex-shrink-0 ml-2 text-gray-500" />
            </div>

            {openDropdownId === field.id && field.options && (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 pb-6 px-4 animate-in fade-in" onClick={() => toggleDropdown(field.id)}>
                <div
                  className="w-full max-w-sm bg-white rounded-t-xl shadow-lg max-h-[50vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-2 border-b border-gray-100">
                    <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto my-1"></div>
                  </div>
                  {field.options.map((option: string, index: number) => (
                    <div
                      key={index}
                      className={`px-4 py-3.5 hover:bg-gray-100 active:bg-gray-200 cursor-pointer text-base border-b border-gray-100 ${fieldValue === option ? 'bg-gray-50 font-medium' : ''}`}
                      onClick={() => {
                        handleInputChange(field.id, option);
                        toggleDropdown(field.id);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isInvalid && <p className="text-xs text-red-500 mt-1">Please select an option</p>}
          </div>
        );
      case 'checkbox':
        return (
          <div className="mb-3" key={field.id}>
            <div className="flex items-start space-x-3">
              <div className="relative flex items-start">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    id={`field-${field.id}`}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-offset-2"
                    onChange={(e) => handleInputChange(field.id, e.target.checked ? 'true' : 'false')}
                    checked={fieldValue === 'true'}
                    required={isRequired}
                    style={{
                      accentColor: card.linkColor === "transparent" ? "#3B82F6" : card.linkColor
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label htmlFor={`field-${field.id}`} className="text-base font-medium break-words">
                  {field.name} {isRequired && <span className="text-red-500">*</span>}
                </label>
                {isInvalid && <p className="text-xs text-red-500 mt-1">This field is required</p>}
              </div>
            </div>
          </div>
        );
      case 'file':
        return (
          <div className="mb-3" key={field.id}>
            {labelComponent}
            <label
              className={`w-full px-4 py-3 border ${isInvalid ? 'border-red-300' : 'border-gray-200'} border-dashed rounded-lg text-base flex items-center justify-center cursor-pointer bg-white hover:bg-gray-50 active:bg-gray-100`}
              style={{
                borderColor: isInvalid ? 'red' : undefined,
                minHeight: '50px'
              }}
            >
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    handleFileUpload(field.id, selectedFile);
                  }
                }}
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
              <FileText className="h-5 w-5 mr-2.5 flex-shrink-0 text-gray-500" />
              <span className="truncate">
                {fieldValue ? (
                  fieldValue === 'Uploading...' ?
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                      {fieldValue}
                    </span> :
                    fieldValue === 'Error uploading file' ?
                      <span className="text-red-500">{fieldValue}</span> :
                      fieldValue
                ) : 'Choose file'}
              </span>
            </label>
            {isInvalid && <p className="text-xs text-red-500 mt-1">Please select a file</p>}
          </div>
        );
      default:
        return null;
    }
  };

  // Hide the default close button
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .leadCaptureFormDialog > button[data-radix-dialog-close] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      if (isOpen) {
        const dialogCloseButtons = document.querySelectorAll('[data-radix-dialog-close]');
        console.log('Dialog close buttons found:', dialogCloseButtons.length);

        const leadCaptureDialog = document.querySelector('.leadCaptureFormDialog');
        if (leadCaptureDialog) {
          const closeButtonsInThisDialog = leadCaptureDialog.querySelectorAll('[data-radix-dialog-close]');
          console.log('Close buttons in lead capture dialog:', closeButtonsInThisDialog.length);
        }
      }
    }, 500);

    return () => {
      document.head.removeChild(style);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="leadCaptureFormDialog sm:max-w-md w-[95vw] max-h-[95vh] rounded-2xl bg-white overflow-hidden p-0 shadow-xl"
        style={{
          fontFamily: card.font || 'Inter'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
          className="w-full h-full"
        >
          <DialogTitle className="hidden" />
          <DialogDescription className="hidden" />

          <div
            className="h-20 sm:h-24 w-full flex justify-center relative"
            style={{
              backgroundColor: card.cardTheme === "transparent" ? "#BFDBFE" : card.cardTheme
            }}
          >
          </div>

          <div className="bg-white rounded-t-2xl -mt-10 px-5 sm:px-6 py-5 relative">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md absolute -top-10">
                <Image
                  src={card.profilePicture || "/defaultpp.png"}
                  alt={card.name}
                  width={80}
                  height={80}
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="mt-12 mb-3 sm:mb-4 text-center">
              <h3 className="font-semibold text-lg">{leadData.formHeader}</h3>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-8 w-8 border-b-2 border-gray-500"
                ></motion.div>
              </div>
            ) : (
              <ScrollArea className="h-[40vh] sm:h-72 pr-2 -mr-2 overflow-y-auto pb-2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="space-y-1"
                >
                  {leadData.fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      {renderField(field)}
                    </motion.div>
                  ))}
                </motion.div>
              </ScrollArea>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="mt-4 sm:mt-5"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3.5 rounded-full text-white font-medium text-base transition-opacity hover:opacity-90 active:opacity-80"
                style={{
                  backgroundColor: card.linkColor === "transparent" ? "#3B82F6" : card.linkColor
                }}
                onClick={handleSubmit}
                disabled={submitting || loading}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    ></motion.span>
                    Connecting...
                  </span>
                ) : leadData.connectButtonText}
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="text-xs text-center text-gray-500 mt-3"
              >
                {leadData.formDisclaimer}
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

const ConnectPage = () => {
  const searchParams = useSearchParams();
  const index = searchParams.get('index');
  const fromdata = searchParams.get('from');
  const params = useParams();
  const connectId = params.connectid as string;
  const handlelinktaps = (link: string, userid: string) => {
    Api.post('/teams/link-tap', {
      "userId": userid,
      "linkName": link

    })
      .then(response => {
        console.log('Link tap recorded:', response.data);
      })
      .catch(error => {
        console.error('Error recording link tap:', error);
      });
  }
  const handleconnecttaps = (userid: string) => {
    Api.get(`/user/${userid}/card/connect-card`)

      .then(response => {
        console.log('Link tap recorded:', response.data);
      })
      .catch(error => {
        console.error('Error recording link tap:', error);
      });
  }
  useEffect(() => {
    (async () => {
      await Api.get(`/user/${connectId}/card/view-card?index=${index}&from=${fromdata}`);
    })();
  }, [connectId, index, fromdata]);
  // State for card data
  const [card, setCard] = useState<UserCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State for lead capture dialog
  const [showLeadCapture, setShowLeadCapture] = useState(false);

  // Detect mobile 
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  // Function to save contact as VCF file
  const saveContact = () => {
    handleconnecttaps(connectId);
    if (!card) return;

    // Find phone number and email from links if available
    let phoneNumber = '';
    let email = '';

    if (card.links && card.links.links && card.links.links.userLinks) {
      // Get phone number from call link
      const callLink = card.links.links.userLinks['call'];
      if (callLink && callLink.username) {
        phoneNumber = callLink.username;
      }

      // Get email from email link
      const emailLink = card.links.links.userLinks['email'];
      if (emailLink && emailLink.username) {
        email = emailLink.username;
      }
    }

    // Generate VCF content
    const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:${card.name}
${phoneNumber ? `TEL;TYPE=CELL:${phoneNumber}\n` : ''}${email ? `EMAIL:${email}\n` : ''}${card.company ? `ORG:${card.company}\n` : ''}${card.jobTitle ? `TITLE:${card.jobTitle}\n` : ''}${card.location ? `ADR:;;${card.location}\n` : ''}END:VCARD`.trim();

    // Create blob and download link
    const blob = new Blob([vcfContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    // Create temporary link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${card.name.replace(/\s+/g, '')}.vcf`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show a simple alert notification

      // Show the Lead Capture Form dialog after downloading the VCF
      setShowLeadCapture(true);
    }, 100);
  };

  // Effect to handle window resize events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Images for different link types
  const linkImages = {
    contact: "/links/contactcard.svg",
    discord: "/links/discord.svg",
    facetime: "/links/facetime.svg",
    calendly: "/links/calendly.svg",
    linkedin: "/links/linkedin.svg",
    instagram: "/links/instagram.svg",
    website: "/links/safari.svg",
    email: "/links/email.svg",
    call: "/links/call.svg",
    twitter: "/links/twitter.svg",
    youtube: "/links/youtube.svg",
    facebook: "/links/facebook.svg",
    whatsapp: "/links/whatsapp.svg",
    tiktok: "/links/tiktok.svg",
    snapchat: "/links/snapchat.svg",
    pinterest: "/links/pinterest.svg",
    twitch: "/links/twitch.svg",
    wechat: "/links/wechat.svg",
    text: "/links/file.svg",
    threads: "/links/threads.svg",
    address: "/links/address.svg",
    telegram: "/links/telegram.svg",
    clubhouse: "/links/clubhouse.svg",
  }

  // Fetch card data
  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);
        const response = await Api.get(`/user/${connectId}/card?index=${index}`);
        console.log("Card data response:", response);
        console.log("User Card:", response.data.userCard);

        if (response.data.userCard) {
          console.log("Card links:", response.data.userCard.links);
          console.log("Card layout:", response.data.userCard.layout || response.data.userCard.cardLayout);
          setCard(response.data.userCard);
          setLoading(false);

          // Show lead capture dialog after a short delay
          const isEnabled = response.data.userCard?.leadCaptureSettings?.isEnabled ||
            response.data.userCard?.leadForm?.settings?.isEnabled;

          if (isEnabled) {
            setTimeout(() => {
              setShowLeadCapture(true);
            }, 500);
          }
        } else {
          console.error("No userCard found in response data:", response.data);
          setError("Card data not found");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching card:", err);
        setError("Failed to load card data");
        setLoading(false);
      }
    };

    if (connectId) {
      fetchCardData();
    }
  }, [connectId, index]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="text-gray-600">{error || "Card not found"}</p>
      </div>
    );
  }

  // Determine card background color
  const bgColor = card.cardTheme === "transparent" ? "#BFDBFE" : card.cardTheme;
  const linkColor = card.linkColor === "transparent" ? "#3B82F6" : card.linkColor;

  // Function to check if links might need scrolling
  const mightNeedScrolling = () => {
    return (card.links?.links?.linkOrder?.length || 0) > 5;
  };

  // Function to get target URL for a link
  const getTargetUrl = (linkKey: string, linkData: UserLink) => {
    // For some predefined link types, handle them specially
    switch (linkKey) {
      case 'email':
        return `mailto:${linkData.username}`;
      case 'call':
        return `tel:${linkData.username}`;
      case 'whatsapp':
        // Format phone number by removing non-digits
        const phone = linkData.username.replace(/\D/g, '');
        return `https://wa.me/${phone}`;
      default:
        // For URLs like website, LinkedIn, etc.
        // Use the provided URL if available, or construct one
        if (linkData.url) return linkData.url;

        // Construct URLs based on the platform
        switch (linkKey) {
          case 'instagram':
            return `https://instagram.com/${linkData.username}`;
          case 'twitter':
            return `https://twitter.com/${linkData.username}`;
          case 'linkedin':
            return `https://linkedin.com/in/${linkData.username}`;
          case 'facebook':
            return `https://facebook.com/${linkData.username}`;
          case 'youtube':
            return `https://youtube.com/${linkData.username}`;
          case 'tiktok':
            return `https://tiktok.com/@${linkData.username}`;
          case 'snapchat':
            return `https://snapchat.com/add/${linkData.username}`;
          case 'pinterest':
            return `https://pinterest.com/${linkData.username}`;
          case 'twitch':
            return `https://twitch.tv/${linkData.username}`;
          case 'threads':
            return `https://threads.net/@${linkData.username}`;
          case 'address':
            return `https://maps.google.com/?q=${encodeURIComponent(linkData.username)}`;
          case 'telegram':
            return `https://t.me/${linkData.username}`;
          default:
            // For other links, try to use username as a URL if it looks like one
            if (linkData.username.startsWith('http')) {
              return linkData.username;
            }
            return '#'; // Fallback to no navigation
        }
    }
  };

  // Get layout from card data - support both layout and cardLayout fields
  const cardLayout = card.layout || card.cardLayout || "Center Aligned";

  return (
    <div className="flex justify-center w-screen items-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md h-screen overflow-hidden shadow-xl"
        style={{
          backgroundColor: bgColor,
          fontFamily: card.font || 'Inter'
        }}
      >
        {/* Layout-specific rendering */}        {cardLayout === "Portrait" ? (
          // Portrait layout - Full profile image as main visual with gradient overlay
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full relative"
          >
            {/* Profile image with lower z-index */}
            <div className="relative w-full h-72 z-10">
              <Image
                src={card.profilePicture || "/defaultpp.png"}
                alt={card.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 448px"
                priority
              />
            </div>
            {/* Background gradient overlay with higher z-index */}
            <div
              className="absolute inset-0 z-20"
              style={{
                background: `linear-gradient(to top, ${bgColor} 0%, ${bgColor} 1%, rgba(255,255,255,0) 40%)`
              }}
            />

            {/* Company logo on bottom right */}
            {card.companyLogo && (
              <motion.div
                initial={{ opacity: 0, scale: 0, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 150 }}
                className="absolute -bottom-14 right-4 w-12 h-12 rounded-full bg-white p-0.5"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={card.companyLogo}
                    alt={card.company || "Company"}
                    className="object-contain rounded-full"
                    fill
                    sizes="48px"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          // Center or Left Aligned layout - Header with cover photo
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="h-48 w-full relative"
          >
            {card.coverPhoto ? (
              <Image
                src={card.coverPhoto}
                alt="Cover Photo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-sky-400 to-blue-600"></div>
            )}
          </motion.div>
        )}

        {/* Profile section - with different alignment based on layout */}
        <div className={`flex flex-col ${cardLayout === "Left Aligned" ? "items-start" : "items-center"} ${cardLayout === "Portrait" ? "" : "-mt-20"} px-4 sm:px-6 relative`}>
          {/* Profile picture - only for non-portrait layouts */}
          {cardLayout !== "Portrait" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.4,
                type: "spring",
                stiffness: 100
              }}
              className="w-32 h-32 rounded-full border-4 border-white bg-white relative"
            >
              <div className="relative w-full h-full">
                <Image
                  src={card.profilePicture || "/defaultpp.png"}
                  alt={card.name}
                  fill
                  className="object-cover rounded-full"
                  sizes="128px"
                  priority
                />
              </div>

              {/* Company logo badge positioned absolutely relative to profile container */}
              {card.companyLogo && cardLayout !== "Portrait" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.9, type: "spring", stiffness: 150 }}
                  className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-white p-0.5 border-3 border-white shadow-md"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={card.companyLogo}
                      alt={card.company || "Company"}
                      className="object-contain rounded-full"
                      fill
                      sizes="48px"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}          {/* User info with conditional text alignment */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className={`${cardLayout === "Left Aligned" ? "text-left" : cardLayout === "Portrait" ? "text-left" : "text-center"} ${cardLayout === "Portrait" ? "px-4 sm:px-5" : "mt-4"} mb-5 sm:mb-6 w-full`}
          >
            {cardLayout === "Portrait" ? (
              // Portrait layout styling
              <>
                <h1 className="text-xl font-bold mb-1">{card.name}</h1>
                <p className="text-sm mb-0.5">{card.jobTitle}</p>
                {card.company && <p className="text-xs mb-0.5">{card.company}</p>}
                {card.location && <p className="text-xs">{card.location}</p>}

                {card.bio && (
                  <div className="mt-3 w-full">
                    <p className="text-xs leading-relaxed">{card.bio}</p>
                  </div>
                )}
              </>
            ) : cardLayout === "Left Aligned" ? (
              // Left aligned layout shows job title and company on separate lines
              <>
                <h1 className="text-2xl font-bold">{card.name}</h1>
                <p className="text-sm mt-1">{card.jobTitle}</p>
                {card.company && <p className="text-sm">{card.company}</p>}
                {card.location && (
                  <p className="text-sm mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {card.location}
                  </p>
                )}

                {card.bio && (
                  <p className="mt-4 text-sm">{card.bio}</p>
                )}
              </>
            ) : (
              // Center aligned layout 
              <>
                <h1 className="text-2xl font-bold">{card.name}</h1>
                <p className="text-sm mt-1">
                  {card.jobTitle}{card.jobTitle && card.company ? " at " : ""}{card.company}
                </p>
                {card.location && (
                  <p className="text-sm mt-1 flex items-center justify-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {card.location}
                  </p>
                )}

                {card.bio && (
                  <p className="mt-4 text-sm">{card.bio}</p>
                )}
              </>
            )}
          </motion.div>
          {/* Quick actions — mobile-first layout */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className={`w-full ${cardLayout === "Portrait" ? "px-5" : ""} mb-6`}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                className="col-span-2 sm:col-span-1 flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-1.5 rounded-2xl px-5 py-4 sm:py-3.5 text-white font-semibold text-base sm:text-sm min-h-[56px] shadow-sm"
                style={{ backgroundColor: linkColor }}
                onClick={saveContact}
              >
                <MdSave className="text-2xl sm:text-lg shrink-0" />
                <span className="text-center leading-tight">Save Contact</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                className="flex flex-row sm:flex-col items-center justify-center gap-2.5 sm:gap-1.5 rounded-2xl px-4 py-4 sm:py-3.5 text-white font-semibold text-base sm:text-sm min-h-[56px] shadow-sm"
                style={{ backgroundColor: linkColor }}
                onClick={() => {
                  if (card?.call) {
                    window.location.href = `tel:${card?.call}`;
                  }
                }}
              >
                <MdCall className="text-2xl sm:text-lg shrink-0" />
                <span>Call</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                className="flex flex-row sm:flex-col items-center justify-center gap-2.5 sm:gap-1.5 rounded-2xl px-4 py-4 sm:py-3.5 text-white font-semibold text-base sm:text-sm min-h-[56px] shadow-sm"
                style={{ backgroundColor: linkColor }}
                onClick={() => {
                  if (card?.email) {
                    window.location.href = `mailto:${card?.email}`;
                  }
                }}
              >
                <MdEmail className="text-2xl sm:text-lg shrink-0" />
                <span>Email</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Links section - with different styling based on layout */}
          {card.links && card.links.links && card.links.links.linkOrder && card.links.links.linkOrder.length > 0 && (
            <div className="w-full pb-8 relative">
              <div className={`${cardLayout !== "Left Aligned" ? "space-y-3" : "space-y-2"} relative`}>
                {/* Show link count if there are many links */}
                {mightNeedScrolling() && (
                  <div className="mb-2 text-center text-xs font-medium text-white/80">
                    {card.links.links.linkOrder.filter(key =>
                      card.links.links && card.links.links.activeLinks && card.links.links.activeLinks[key]
                    ).length} links available
                  </div>
                )}    {/* For Portrait and Center Aligned, we want to show links in a grid of icons */}
                {(cardLayout === "Portrait" || cardLayout === "Center Aligned") ? (
                  <div className={`flex flex-wrap ${cardLayout === "Portrait" ? "justify-center gap-4 mt-6 px-2" : "justify-center gap-4 mt-3"}`}>
                    {card.links.links.linkOrder
                      .filter(key => card.links.links && card.links.links.activeLinks && card.links.links.activeLinks[key])
                      // Limit initial display to 6 links
                      .map((linkKey) => {
                        const linkData = card.links.links && card.links.links.userLinks && card.links.links.userLinks[linkKey];
                        if (!linkData) return null;

                        const linkName = linkData.title || linkKey.charAt(0).toUpperCase() + linkKey.slice(1);

                        // Determine icon to show
                        let icon;
                        const linkImageKey = linkKey as keyof typeof linkImages;

                        if (linkImages[linkImageKey]) {
                          icon = (
                            <div className="relative w-10 h-10">
                              <Image
                                src={linkImages[linkImageKey]}
                                alt={linkName}
                                fill
                                sizes="20px"
                              />
                            </div>
                          );
                        } else {
                          icon = <LinkIcon className="h-8 w-8 text-white" />;
                        }

                        // Get target URL
                        const targetUrl = getTargetUrl(linkKey, linkData);

                        return (
                          <Link
                            href={targetUrl}
                            key={linkKey}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-underline text-inherit focus:outline-none"
                            onClick={(e) => {
                              // Add a small visual feedback on click before navigation
                              handlelinktaps(linkImageKey, connectId);
                            }}
                          >
                            <motion.div
                              className="flex flex-col items-center"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-1"
                                style={{
                                  backgroundColor: linkColor
                                }}
                              >
                                {icon}
                              </div>
                              <span className="text-[9px] font-medium text-center">
                                {linkName}
                              </span>
                            </motion.div>
                          </Link>
                        );
                      })}
                  </div>
                ) : (
                  // For Left Aligned, we show a vertical list of links
                  card.links.links.linkOrder
                    .filter(key => card.links.links && card.links.links.activeLinks && card.links.links.activeLinks[key])
                    .map((linkKey) => {
                      const linkData = card.links.links && card.links.links.userLinks && card.links.links.userLinks[linkKey];
                      if (!linkData) return null;

                      const linkName = linkData.title || linkKey.charAt(0).toUpperCase() + linkKey.slice(1);

                      // Determine icon to show
                      let icon;
                      const linkImageKey = linkKey as keyof typeof linkImages;

                      if (linkImages[linkImageKey]) {
                        icon = (
                          <div className="relative w-5 h-5">
                            <Image
                              src={linkImages[linkImageKey]}
                              alt={linkName}
                              fill
                              sizes="20px"
                            />
                          </div>
                        );
                      } else {
                        icon = <LinkIcon className="h-5 w-5 text-white" />;
                      }

                      // Determine the URL to navigate to
                      const targetUrl = getTargetUrl(linkKey, linkData);

                      return (
                        <Link
                          href={targetUrl}
                          key={linkKey}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full no-underline text-inherit focus:outline-none"
                          onClick={(e) => {
                            // Add a small visual feedback on click before navigation
                            handlelinktaps(linkImageKey, connectId);
                            const target = e.currentTarget;
                            target.style.opacity = '0.7';
                            setTimeout(() => {
                              target.style.opacity = '1';
                            }, 150);
                          }}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.05 * parseInt(linkKey) || 0
                            }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex flex-row-reverse justify-between items-center w-full p-3 rounded-md bg-white/10 hover:bg-white/20 focus:bg-white/30 transition-colors duration-200 group"
                          >
                            <div
                              className="w-10 h-10 rounded-md flex items-center justify-center mr-3"
                              style={{ backgroundColor: linkColor }}
                            >
                              {icon}
                            </div>
                            <div>
                              <span className="font-semibold text-xs">{linkName}</span>

                              <div className="ml-auto font-medium text-black/60">
                                <span> {linkData.username || ""} </span>
                              </div>

                            </div>


                          </motion.div>
                        </Link>
                      );
                    })
                )}

                {/* Show more button for grid layouts with more than 6 links */}

              </div>

            </div>
          )}
        </div>
      </motion.div>

      {/* Lead Capture Form Dialog */}
      {card && (
        <LeadCaptureForm
          card={card}
          isOpen={showLeadCapture}
          onClose={() => setShowLeadCapture(false)}
          connectId={connectId}
        />
      )}
    </div>
  );
};

export default ConnectPage;
