"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronDown,
  PlusCircle,
  Search,
  User2,
  X,
  BookOpen,
  HeadphonesIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";

type Integration = {
  logo: string;
  name: string;
};

type IntegrationType = {
  [key in "CRM" | "HR" | "Email" | "SAML" | "Calendar Booking"]: Integration[];
};

export default function IntegrationsPage() {
  const [activeSection, setActiveSection] = useState<string>("CRM");
  const [isManualScroll, setIsManualScroll] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const categories = useMemo<(keyof IntegrationType)[]>(
    () => ["CRM", "HR", "Email", "SAML", "Calendar Booking"],
    []
  );

  const scrollToSection = (category: string) => {
    const targetElement = document.getElementById(category);
    const scrollElement = document.querySelector(
      "[data-radix-scroll-area-viewport]"
    );

    if (targetElement && scrollElement) {
      setIsManualScroll(true);

      const headerOffset = 80;
      const elementPosition = targetElement.offsetTop;

      scrollElement.scrollTo({
        top: elementPosition - headerOffset,
        behavior: "smooth",
      });

      setActiveSection(category);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsManualScroll(false);
      }, 1000);
    }
  };

  useEffect(() => {
    const scrollElement = document.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!scrollElement) return;

    const handleScroll = () => {
      if (isManualScroll) return;

      const scrollPosition = scrollElement.scrollTop;
      const headerOffset = 80;

      for (const category of categories) {
        const element = document.getElementById(category);
        if (element) {
          const elementTop = element.offsetTop - headerOffset;
          const elementBottom = elementTop + element.offsetHeight;

          if (
            scrollPosition >= elementTop - 50 &&
            scrollPosition <= elementBottom - headerOffset
          ) {
            setActiveSection(category);
            break;
          }
        }
      }
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [categories, isManualScroll]);

  const integrations: IntegrationType = {
    CRM: [
      { logo: "/company_logo.png", name: "Salesforce" },
      { logo: "/company_logo.png", name: "HubSpot" },
      { logo: "/company_logo.png", name: "Zoho" },
      { logo: "/company_logo.png", name: "Pipedrive" },
      { logo: "/company_logo.png", name: "Microsoft Dynamics" },
      { logo: "/company_logo.png", name: "Sugar CRM" },
      { logo: "/company_logo.png", name: "Freshsales" },
      { logo: "/company_logo.png", name: "Insightly" },
      { logo: "/company_logo.png", name: "Close" },
      { logo: "/company_logo.png", name: "Copper" },
      { logo: "/company_logo.png", name: "Vtiger" },
    ],
    HR: [
      { logo: "/company_logo.png", name: "Workday" },
      { logo: "/company_logo.png", name: "BambooHR" },
      { logo: "/company_logo.png", name: "Personio" },
      { logo: "/company_logo.png", name: "Gusto" },
    ],
    Email: [
      { logo: "/company_logo.png", name: "Gmail" },
      { logo: "/company_logo.png", name: "Outlook" },
      { logo: "/company_logo.png", name: "Yahoo Mail" },
    ],
    SAML: [
      { logo: "/company_logo.png", name: "Okta" },
      { logo: "/company_logo.png", name: "Auth0" },
    ],
    "Calendar Booking": [{ logo: "/company_logo.png", name: "Calendly" }],
  };

  return (
    <div className="w-full">
      <div className="p-2">
        <div className="h-full w-full">
          <div className="mx-auto py-2 px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-3">
              <div>
                <h1 className="text-2xl font-bold">Integrations</h1>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-full">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        className="rounded-full flex-1 md:flex-none"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Request an Integration
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-3">
                      {/* Add Subteam form content here */}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="space-y-2 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="w-full rounded-full bg-white pl-10"
                  placeholder="Search integrations..."
                />
              </div>

              <div className="w-full max-w-[1220px] h-[500px] bg-white rounded-lg shadow-sm mx-auto mt-2">
                <div className="flex flex-col h-full">
                  {/* Refined Navigation */}
                  <nav className="flex flex-row border border-[#2196f3]/20 bg-white/95 backdrop-blur-sm sticky top-0 z-10 h-[32px] w-[460px] ml-4 mt-2 rounded-lg shadow-sm">
                    <div className="flex w-full relative items-stretch h-full">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => scrollToSection(category)}
                          className={`flex-1 relative text-[13px] font-medium transition-all duration-200 ease-out flex items-center justify-center hover:bg-[#2196f3]/5 active:bg-[#2196f3]/10 ${
                            activeSection === category
                              ? "text-[#2196f3] font-semibold"
                              : "text-[#2196f3]/70 hover:text-[#2196f3]"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                      <div
                        className="absolute bottom-0 h-[2px] bg-[#2196f3] transform-gpu transition-transform duration-200 ease-out will-change-transform"
                        style={{
                          width: `${100 / categories.length}%`,
                          transform: `translateX(${
                            categories.indexOf(
                              activeSection as keyof IntegrationType
                            ) * 100
                          }%)`,
                        }}
                      />
                    </div>
                  </nav>

                  {/* Scrollable Content Area */}
                  <ScrollArea className="flex-1 w-full scroll-area-viewport">
                    <div className="p-4">
                      {categories.map((category) => (
                        <div
                          key={category}
                          id={category}
                          className="mb-8 scroll-mt-[60px]"
                        >
                          <h2 className="text-lg font-semibold mb-4">
                            {category}
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {integrations[category].map(
                              (integration, index) => (
                                <Card
                                  key={index}
                                  className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-[70px] w-[270px]"
                                >
                                  <div className="flex items-center h-full px-4">
                                    <div className="bg-gray-50 p-2 rounded-lg mr-3 group-hover:bg-[#2196f3]/5 transition-colors duration-300">
                                      <Image
                                        src={integration.logo}
                                        alt={`${integration.name} logo`} width="100" height="100"
                                        className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
                                      />
                                    </div>
                                    <span className="font-medium text-gray-700 flex-1 group-hover:text-[#2196f3] transition-colors duration-300">
                                      {integration.name}
                                    </span>
                                  </div>
                                </Card>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Need Help Section */}
              <div className="w-full max-w-[1220px] h-[200px] bg-white rounded-lg shadow-sm mx-auto mt-3">
                <div className="p-4 h-full">
                  <h2 className="text-lg font-semibold mb-3">Need Help?</h2>
                  <div className="flex items-center flex-col md:flex-row gap-4 h-[calc(100%-2rem)]">
                    <Card className="flex-1 h-[84px] p-6">
                      <div className="h-full flex items-center justify-between space-y-4">
                        <div>
                          <p className="font-semibold ">
                            Speak with an Integration Specialist
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Get personalized help with your integration needs
                          </p>
                        </div>
                        <button className="flex items-center justify-center text-sm px-4 py-1 bg-primary text-white rounded-full font-medium">
                          {" "}
                          Schedule Meeting
                        </button>
                      </div>
                    </Card>

                    <Card className="flex-1 p-6 h-[84px]">
                      <div className="h-full flex items-center justify-between  space-y-4">
                        <div>
                          <p className="font-semibold">
                            View Integration Documentation
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Explore our detailed integration guides
                          </p>
                        </div>
                        <button className="flex items-center justify-center text-sm px-4 py-1 border-[1px] border-black/20 hover:border-black/40 transition-all duration-300 bg-white text-black/60 rounded-full font-medium">
                          {" "}
                          View Docs
                        </button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
