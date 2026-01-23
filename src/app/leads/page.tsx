"use client";

import { Card } from "@/components/ui/card";
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RefreshCw,
  Filter,
  UserPlus,
  Download,
  Mail,
  Tags,
  Users2,
  FileText,
  Check,
  X,
  Target,
  ArrowRightLeft,
  PlusCircle,
  MinusCircle,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Api } from "@/lib/api";
import { useUserStore } from "@/store/user-store";
import { Input } from "@/components/ui/input";
import { useCallback } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const filterGroups = [
  {
    name: "Lead Type",
    items: ["Lead Capture", "Business Card", "Popl to Popl", "QR Code", "Manual Entry"]
  },
  {
    name: "Status",
    items: ["New", "Contacted", "Meeting Scheduled", "Converted", "Lost"]
  },
  {
    name: "Source",
    items: ["Website", "Social Media", "Event", "Referral", "Direct"]
  },
  {
    name: "Priority",
    items: ["High", "Medium", "Low"]
  }
];

const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

// Create a new component for the content that uses useSearchParams
function LeadsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const tableCardRef = useRef<HTMLDivElement>(null);
  const { user, fetchUser, isLoading: isUserLoading } = useUserStore();
  const [dataleads, setdataleads] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
  const [contentHeight, setContentHeight] = useState(508);
  const hasSelectedFilters = Object.values(selectedFilters).some(filters => filters.length > 0);

  // Fetch leads when component mounts
  const fetchLeads = useCallback(async () => {
    try {
      const leaddatares = await Api.get(
        `/leads/all?teamId=${user?.team}&page=1&size=100`
      );
      setdataleads(leaddatares?.data?.leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  },[user?.team]);
  useEffect(() => {
    if (!isUserLoading && user) {
      fetchLeads();
    }
  }, [user, isUserLoading, fetchLeads]);

  // Filter handling functions
  const handleFilterSelect = (group: string, item: string) => {
    setSelectedFilters(prev => {
      const groupFilters = prev[group] || [];
      const newFilters = {
        ...prev,
        [group]: groupFilters.includes(item)
          ? groupFilters.filter(i => i !== item)
          : [...groupFilters, item]
      };
      return newFilters;
    });
  };

  const handleCollapsibleChange = (isOpen: boolean, groupName: string) => {
    setOpenCollapsible(isOpen ? groupName : null);
    const baseHeight = 508;
    const expandedHeight = baseHeight + (isOpen ? 160 : 0);
    setContentHeight(expandedHeight);
  };

  const clearFilters = () => {
    setSelectedFilters({});
    // Reset URL parameters
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(filterGroups).forEach(key => {
      params.delete(key.toLowerCase());
    });
    const newUrl = pathname;
    router.push(newUrl);
  };

  // Update URL when filters change
  useEffect(() => {
    if (Object.keys(selectedFilters).length > 0) {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(selectedFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          params.set(key.toLowerCase(), values.join(','));
        } else {
          params.delete(key.toLowerCase());
        }
      });
      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl);
    }
  }, [selectedFilters, router, pathname, searchParams]);

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlFilters: { [key: string]: string[] } = {};
    filterGroups.forEach(group => {
      const paramValue = searchParams.get(group.name.toLowerCase());
      if (paramValue) {
        urlFilters[group.name] = paramValue.split(',').filter(Boolean);
      }
    });
    setSelectedFilters(urlFilters);
  }, [searchParams]);

  // Apply filters to leads
  const filteredLeads = useMemo(() => {
    if (!hasSelectedFilters) return dataleads;

    return dataleads.filter(lead => {
      return Object.entries(selectedFilters).every(([group, values]) => {
        if (!values.length) return true;

        switch (group) {
          case "Lead Type":
            return values.includes(lead.type);
          case "Status":
            return values.includes(lead.status);
          case "Source":
            return values.includes(lead.source);
          case "Priority":
            return values.includes(lead.priority);
          default:
            return true;
        }
      });
    });
  }, [dataleads, selectedFilters, hasSelectedFilters]);

  const toggleSelectAll = () => {
    if (selectedItems.length === dataleads.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(dataleads.map((lead) => lead._id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const navigateToLeadDetail = (leadId: string) => {
    router.push(`/leads/${leadId}`);
  };

  const closeSelectionMenu = () => {
    setSelectedItems([]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchLeads();
    } catch (error) {
      console.error("Error refreshing leads:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await Api.get(`/leads/export?teamId=${user?.team}`, {
        responseType: 'blob'
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1]
        : `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting leads:', error);
    }
  };

  const handleSingleExport = async (leadId: string) => {
    try {
      const response = await Api.get(`/leads/export/${leadId}`, {
        responseType: 'blob'
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1]
        : `lead-${leadId}-export-${new Date().toISOString().slice(0, 10)}.csv`;

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting lead:', error);
    }
  };

  return (
    <div className="w-full">
      <div className="p-3">
        <div className="h-full w-full">
          <div className="mx-auto py-6 px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Leads</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-0">
                    <LayoutGroup>
                      <motion.div
                        className="flex flex-col relative"
                        animate={{
                          height: contentHeight
                        }}
                        transition={springConfig}
                      >
                        <div className="flex-1 overflow-y-auto p-4">
                          <Input
                            className="mb-4 bg-black/5 border-none rounded-full"
                            placeholder="Search..."
                          />
                          <div className="space-y-4 pb-16">
                            {filterGroups.map((group) => (
                              <Collapsible
                                key={group.name}
                                open={openCollapsible === group.name}
                                onOpenChange={(isOpen) => handleCollapsibleChange(isOpen, group.name)}
                              >
                                <motion.div layout>
                                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl text-black/70 px-3 py-4 text-xs font-medium bg-accent/50">
                                    {group.name}
                                    <motion.div
                                      animate={{ rotate: openCollapsible === group.name ? 180 : 0 }}
                                      transition={springConfig}
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </motion.div>
                                  </CollapsibleTrigger>
                                  <motion.div
                                    initial={false}
                                    animate={{
                                      backgroundColor: openCollapsible === group.name
                                        ? "hsl(var(--accent) / 0.5)"
                                        : "rgba(0,0,0,0)"
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="rounded-xl overflow-hidden"
                                    layout
                                  >
                                    <CollapsibleContent className="data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up">
                                      <div className="px-4 py-2 space-y-2">
                                        {group.items.map((item) => (
                                          <div
                                            key={item}
                                            className="flex items-center space-x-2"
                                          >
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="flex w-full justify-start gap-2 hover:bg-transparent"
                                              onClick={() => handleFilterSelect(group.name, item)}
                                            >
                                              <motion.div
                                                className={cn(
                                                  "w-4 h-4 border rounded flex items-center justify-center",
                                                  selectedFilters[group.name]?.includes(item)
                                                    ? "bg-black border-black"
                                                    : "border-gray-300"
                                                )}
                                                whileTap={{ scale: 0.9 }}
                                              >
                                                {selectedFilters[group.name]?.includes(item) && (
                                                  <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={springConfig}
                                                  >
                                                    <Check className="h-2 w-2 text-white stroke-[4]" />
                                                  </motion.div>
                                                )}
                                              </motion.div>
                                              {item}
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </CollapsibleContent>
                                  </motion.div>
                                </motion.div>
                              </Collapsible>
                            ))}
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4 border-t bg-background/80 backdrop-blur-sm">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={clearFilters}
                            size="sm"
                            className="rounded-full hover:bg-accent/50"
                          >
                            Clear Filters
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-full"
                            disabled={!hasSelectedFilters}
                            variant={hasSelectedFilters ? "default" : "secondary"}
                            onClick={() => {
                              // Force re-render
                              setdataleads([...dataleads]);
                            }}
                          >
                            Apply Filters
                          </Button>
                        </div>
                      </motion.div>
                    </LayoutGroup>
                  </PopoverContent>
                </Popover>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={handleExport}
                  disabled={!filteredLeads?.length}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card
              ref={tableCardRef}
              className="w-full border rounded-lg overflow-hidden"
            >
              <ScrollArea className="w-full">
                <div style={{ minWidth: "100%" }}>
                  <Table>
                    <TableHeader>
                      <TableRow className="h-[48px]">
                        <TableHead className="w-[300px]">
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={
                                selectedItems.length === filteredLeads?.length &&
                                filteredLeads?.length > 0
                              }
                              onCheckedChange={toggleSelectAll}
                              className="ml-4 data-[state=checked]:bg-black data-[state=checked]:border-black"
                            />
                            <span className="text-sm font-medium">
                              Lead Info
                            </span>
                          </div>
                        </TableHead>
                        <TableHead style={{ width: "15%" }}>Connected with</TableHead>
                        <TableHead style={{ width: "15%" }}>Date</TableHead>
                        <TableHead
                          className="text-right"
                          style={{ width: "10%" }}
                        >
                          Export
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads?.map((lead) => (
                        <TableRow
                          key={lead._id}
                          className="group hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => navigateToLeadDetail(lead._id)}
                        >
                          <TableCell>
                            <div
                              className="flex items-center gap-4 ml-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                checked={selectedItems.includes(lead._id)}
                                onCheckedChange={() =>
                                  toggleSelectItem(lead._id)
                                }
                                className="data-[state=checked]:bg-black data-[state=checked]:border-black transition-all duration-200 group-hover:border-black"
                              />
                              <div
                                className={`w-8 h-8 rounded-full ${lead.title[0].toLowerCase() === "s"
                                    ? "bg-pink-200 text-pink-600"
                                    : lead.title[0].toLowerCase() === "k"
                                      ? "bg-purple-200 text-purple-600"
                                      : lead.title[0].toLowerCase() === "i"
                                        ? "bg-blue-200 text-blue-600"
                                        : lead.title[0].toLowerCase() === "b"
                                          ? "bg-amber-100 text-amber-600"
                                          : "bg-blue-100 text-blue-600"
                                  } flex items-center justify-center text-sm uppercase font-medium`}
                              >
                                {lead.title[0]}
                              </div>
                              <div>
                                <div
                                  className="font-medium text-base"
                                  onClick={() => navigateToLeadDetail(lead._id)}
                                >
                                  {lead.title}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center justify-center mr-14 gap-2">
                              <Image
                                src={
                                  lead.user.profileImage || "/company_logo.png"
                                }
                                alt="Connected Profile"
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            </div>
                          </TableCell>

                          <TableCell>{lead.createdAt || "No date"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              className="rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSingleExport(lead._id);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </Card>

            <AnimatePresence>
              {selectedItems.length > 0 && (
                <motion.div
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 60, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed bottom-0 h-[60px] bg-black text-white flex items-center"
                  style={{
                    left:
                      tableCardRef.current?.getBoundingClientRect().left ??
                      "calc(270px + 1.5rem)",
                    width: tableCardRef.current?.offsetWidth,
                    borderRadius: "12px 12px 0 0",
                    padding: "0 0.75rem",
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <motion.span
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="text-sm text-white/70"
                      >
                        {selectedItems.length} Selected
                      </motion.span>

                      <Separator
                        orientation="vertical"
                        className="h-6 bg-white/20 mx-2"
                      />

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="h-9 px-3 text-sm font-medium text-white hover:bg-white/20 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <Target className="h-4 w-4" />
                        Add to Campaign
                      </motion.button>

                      <Separator
                        orientation="vertical"
                        className="h-6 bg-white/20"
                      />

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="h-9 px-3 text-sm font-medium text-white hover:bg-white/20 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add Tag
                      </motion.button>

                      <Separator
                        orientation="vertical"
                        className="h-6 bg-white/20"
                      />

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="h-9 px-3 text-sm font-medium text-white hover:bg-white/20 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <MinusCircle className="h-4 w-4" />
                        Remove Tag
                      </motion.button>

                      <Separator
                        orientation="vertical"
                        className="h-6 bg-white/20"
                      />

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="h-9 px-3 text-sm font-medium text-white hover:bg-white/20 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                        Reassign
                      </motion.button>

                      <Separator
                        orientation="vertical"
                        className="h-6 bg-white/20"
                      />

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="h-9 px-3 text-sm font-medium text-white hover:bg-white/20 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        Send Mail
                      </motion.button>

                      <Separator
                        orientation="vertical"
                        className="h-6 bg-white/20"
                      />

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="h-9 px-3 text-sm font-medium text-white hover:bg-white/20 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Export to CRM
                      </motion.button>
                    </div>

                    <div className="flex items-center">
                      <Separator
                        orientation="vertical"
                        className="h-6 bg-white/20 mx-2"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors"
                        onClick={closeSelectionMenu}
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const isLoading = usePageLoading();

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <LeadsContent />
    </Suspense>
  );
}
