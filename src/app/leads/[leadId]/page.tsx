"use client"

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, FileText, Mail, Phone, MapPin, ExternalLink, MoreHorizontal, Users2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Type for Lead data
interface Lead {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  companyLogo?: string;
  jobTitle?: string;
  location?: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
  links?: Record<string, any>;
  source?: string;
  tags?: string[];
  notes?: string;
  createdAt?: string;
  lastActivity?: string;
  addressStreet?: string;
  addressState?: string;
  addressZip?: string;
  addressCountry?: string;
  addressStateCode?: string;
  companyDescription?: string;
  companyFoundedYear?: string;
  companyNumberOfEmployees?: string;
  type: "Lead Capture" | "Business Card" | "Popl to Popl"; // Required field
  // Allow for dynamic properties from API
  [key: string]: any;
}

const LeadDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const leadId = params.leadId as string;
  console.log("Lead ID from params:", params, leadId);
  
  // State for lead data
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch lead data
  useEffect(() => {
    // Track if component is mounted
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchLeadData = async () => {
      try {
        if (isMounted) setLoading(true);
        
        console.log("Fetching data for lead ID:", leadId);
        
        // Fetch data from the API
        try {
          // Using a timeout to ensure we don't have race conditions
          const timeoutId = setTimeout(() => {
            if (isMounted) {
              controller.abort();
              console.log("Request timed out");
              setError("Request timed out");
              setLoading(false);
            }
          }, 30000); // 30 second timeout
          
          const response = await fetch(`/api/leads/${leadId}`, {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!isMounted) return;
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("API response:", data);
          
          // Determine lead type based on leadId or data
          let leadType: "Lead Capture" | "Business Card" | "Popl to Popl";
          
          // Determine type from data or fallback to ID-based logic
          if (data.lead?.leadData?.type) {
            leadType = data.lead.leadData.type;
          } else if (leadId === "1") {
            leadType = "Lead Capture";
          } else if (leadId === "2") {
            leadType = "Business Card";
          } else if (leadId === "3") {
            leadType = "Popl to Popl";
          } else {
            // Default to Lead Capture for any other ID
            leadType = "Lead Capture";
          }
          
          // Create lead object directly from API data
          const leadData: Lead = {
            id: leadId,
            type: leadType,
            // Include all leadData fields from API
            ...data.lead?.leadData
          };
          
          if (isMounted) {
            setLead(leadData);
            setLoading(false);
          }
        } catch (apiError: any) {
          // Don't process errors if component unmounted or request was intentionally aborted
          if (!isMounted || apiError.name === 'AbortError') {
            return;
          }
          
          console.error("API error:", apiError);
          
          // Fallback to dummy data if API fails
          console.warn("API fetch failed, using dummy data instead");
          
          let leadType: "Lead Capture" | "Business Card" | "Popl to Popl";
          
          if (leadId === "1") {
            leadType = "Lead Capture";
          } else if (leadId === "2") {
            leadType = "Business Card";
          } else if (leadId === "3") {
            leadType = "Popl to Popl";
          } else {
            leadType = "Lead Capture";
          }
          
          // Create dummy data structured like API response
          const dummyData: Lead = {
            id: leadId,
            type: leadType,
            name: "Sample Contact",
            email: "contact@example.com",
            phoneNumber: "123456789",
            company: "Example Company",
            jobTitle: "Position",
            location: "123 Example St, City, Country",
            createdAt: new Date().toLocaleDateString(),
            lastActivity: new Date().toLocaleDateString(),
            links: {
              website: "www.example.com",
              linkedin: "examplecompany"
            }
          };
          
          if (isMounted) {
            setLead(dummyData);
            setLoading(false);
          }
        }
      } catch (err: any) {
        // Don't process errors if component unmounted or request was intentionally aborted
        if (!isMounted || err.name === 'AbortError') {
          return;
        }
        
        console.error("Error fetching lead:", err);
        
        if (isMounted) {
          setError("Failed to load lead data");
          setLoading(false);
        }
      }
    };

    if (leadId) {
      fetchLeadData();
    }
    
    // Cleanup function to run when component unmounts or dependencies change
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [leadId]); // Only re-run if leadId changes

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="text-gray-600">{error || "Lead not found"}</p>
      </div>
    );
  }

  // Type'a göre farklı görünümler için render fonksiyonları
  const renderLeadCapture = () => {
    // Exclude some fields that we don't want to display as key-value pairs
    const excludedFields = ['id', 'type', 'links', 'tags', 'profilePicture', 'coverPhoto', 'companyLogo'];
    
    // Get all lead data fields as key-value pairs
    const leadDataEntries = Object.entries(lead || {}).filter(([key]) => 
      !excludedFields.includes(key) && lead[key] !== undefined && lead[key] !== null
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main information column */}
        <div className="md:col-span-3 space-y-6">
          <Card className="overflow-hidden border-blue-200">
            <div className="bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Users2 className="h-10 w-10 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Lead Capture</h2>
                    <p className="text-sm text-gray-500">Captured on form submission</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Save as Contact
                </Button>
              </div>
              <Separator className="my-4" />
              
              {/* Lead form data - Dynamic key-value pairs */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {/* Display all lead data fields dynamically */}
                {leadDataEntries.map(([key, value]) => (
                  <div key={key}>
                    <div className="text-sm text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-sm">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };
  
  const renderBusinessCard = () => {
    // Exclude some fields that we don't want to display as key-value pairs
    const excludedFields = ['id', 'type', 'links', 'tags', 'profilePicture', 'coverPhoto', 'companyLogo'];
    
    // Get all lead data fields as key-value pairs
    const leadDataEntries = Object.entries(lead || {}).filter(([key]) => 
      !excludedFields.includes(key) && lead[key] !== undefined && lead[key] !== null
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ana bilgi kolonu */}
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden border-green-200">
            <div className="bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 rounded-full p-2">
                    <FileText className="h-10 w-10 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Business Card</h2>
                    <p className="text-sm text-gray-500">Scanned on {lead?.createdAt}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Contact
                </Button>
              </div>
              <Separator className="my-4" />
              
              {/* Main content */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {/* Display all lead data fields dynamically */}
                {leadDataEntries.map(([key, value]) => (
                  <div key={key} className={typeof value === 'string' && value.length > 50 ? 'col-span-2' : ''}>
                    <div className="text-sm text-gray-500">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="text-base">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  </div>
                ))}
                
                {/* Add website link if available */}
                {lead?.links?.website && (
                  <div>
                    <div className="text-sm text-gray-500">Website</div>
                    <div className="text-base text-blue-600 hover:underline cursor-pointer">{lead?.links?.website}</div>
                  </div>
                )}
              </div>
            </div>
          </Card>
          
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-medium">Additional Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Display links (except website which is already shown) */}
                {lead?.links && Object.entries(lead.links)
                  .filter(([key]) => key !== 'website')
                  .map(([key, value]) => (
                    <div key={key}>
                      <div className="text-sm text-gray-500">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </div>
                      <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                        {String(value)}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right column with business card */}
        <div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm text-gray-500 mb-2">{lead?.name}&apos;s business card</h3>
            <div className="relative w-full aspect-[1.7/1] rounded-lg overflow-hidden border">
              <Image 
                src={lead?.companyLogo || "/babel.png"}
                alt="Business Card"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderPoplToPopl = () => {
    // Exclude some fields that we don't want to display as key-value pairs
    const excludedFields = ['id', 'type', 'links', 'tags', 'profilePicture', 'coverPhoto', 'companyLogo'];
    
    // Get all lead data fields as key-value pairs
    const leadDataEntries = Object.entries(lead || {}).filter(([key]) => 
      !excludedFields.includes(key) && lead[key] !== undefined && lead[key] !== null
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ana bilgi kolonu */}
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden border-purple-200">
            <div className="bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 rounded-full p-2">
                    <Target className="h-10 w-10 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Popl to Popl</h2>
                    <p className="text-sm text-gray-500">Connected on {lead?.createdAt}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </div>
              <Separator className="my-4" />
              
              {/* Connection details */}
              <div className="mb-6 p-3 bg-purple-50 rounded-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-purple-300">
                    <Image
                      src={lead?.profilePicture || "/defaultpp.png"}
                      alt={lead?.name || "Contact"}
                      className="object-cover"
                      fill
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{lead?.name || "Contact"}</h3>
                    <p className="text-sm text-gray-600">{lead?.jobTitle || ""}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>{lead?.lastActivity || ""}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {lead?.phoneNumber && (
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Phone className="h-3.5 w-3.5 mr-1" />
                      Call
                    </Button>
                  )}
                  {lead?.email && (
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      Email
                    </Button>
                  )}
                  {lead?.links?.website && (
                    <Button variant="outline" size="sm" className="rounded-full">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Website
                    </Button>
                  )}
                  {lead?.links?.linkedin && (
                    <Button variant="outline" size="sm" className="rounded-full">
                      <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Contact details - all fields dynamically */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {/* Display all lead data fields dynamically */}
                {leadDataEntries.map(([key, value]) => (
                  <div key={key} className={typeof value === 'string' && value.length > 50 ? 'col-span-2' : ''}>
                    <div className="text-sm text-gray-500">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="text-sm">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right column */}
        <div className="space-y-4">
          {/* We can leave this empty or add additional information here if needed */}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* Back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      {/* Render different layout based on lead type */}
      {lead.type === "Lead Capture" && renderLeadCapture()}
      {lead.type === "Business Card" && renderBusinessCard()}
      {lead.type === "Popl to Popl" && renderPoplToPopl()}
    </div>
  );
};

export default LeadDetailPage;