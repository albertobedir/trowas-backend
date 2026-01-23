"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface PageSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dashboard" | "details" | "simple";
}

export function PageSkeleton({
  variant = "simple",
  ...props
}: PageSkeletonProps) {
  if (variant === "dashboard") {
    return (
      <div className="p-6 pt-8 w-full mx-auto">
        {/* Header section skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
        
        {/* Main grid layout skeleton */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Card className="shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <Skeleton className="h-14 w-14 rounded-full mb-3" />
                      <Skeleton className="h-5 w-16 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            <Card className="shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-4 mt-4">
                  {Array(2).fill(0).map((_, i) => (
                    <div key={i} className="bg-gray-50/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            <Card className="shadow-sm">
              <div className="p-6">
                <div className="mb-4">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-3.5 border-b">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-14" />
                        <Skeleton className="h-5 w-48" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          
          {/* Right Column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card className="shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-4 w-10" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            <Card className="shadow-sm">
              <div className="p-6 text-center">
                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-5 w-48 mx-auto mb-2" />
                <Skeleton className="h-4 w-64 mx-auto mb-4" />
                <Skeleton className="h-8 w-32 mx-auto rounded-full" />
              </div>
            </Card>
          </div>
          
          {/* Full Width Section */}
          <div className="col-span-12">
            <Card className="shadow-sm">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-9 w-36 rounded-full" />
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col p-5 border rounded-xl">
                      <div className="mb-3 flex justify-center">
                        <Skeleton className="h-16 w-16 rounded-lg" />
                      </div>
                      <Skeleton className="h-5 w-32 mx-auto mb-2" />
                      <Skeleton className="h-4 w-full mx-auto mb-4" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "details") {
    return (
      <div className="h-screen flex items-center justify-center p-4 overflow-hidden">
        <Card className="w-[95%] max-w-[1220px] h-[90vh] max-h-[800px] shadow-sm">
          <div className="p-6 pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-9 w-36" />
            </div>
          </div>
          <div className="p-6 h-[calc(90vh-80px)] max-h-[720px]">
            <div className="space-y-8 pb-8">
              <div className="space-y-3">
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <Skeleton className="h-24 w-24 rounded-lg" />
                  <div className="p-4 rounded-md w-full">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                </div>
              </div>
              
              <Skeleton className="h-px w-full" />
              
              <div className="space-y-3 max-w-md w-full">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              
              <Skeleton className="h-px w-full" />
              
              <div className="space-y-3 max-w-md w-full">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              
              <Skeleton className="h-px w-full" />
              
              <div className="space-y-5">
                <div className="space-y-3 max-w-md w-full">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                
                <div className="space-y-3 max-w-md w-full">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
              </div>
              
              <Skeleton className="h-px w-full" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              
              <Skeleton className="h-px w-full" />
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-80" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <Skeleton className="h-10 w-64" />
              </div>
              
              <Skeleton className="h-px w-full" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              
              <div className="flex justify-end pt-4">
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  // Default simple skeleton
  return (
    <div className="container mx-auto py-6 px-4">
      <Skeleton className="h-8 w-64 mb-6" />
      <Card className="w-full shadow-sm">
        <div className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </Card>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <div className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </Card>
        <Card className="shadow-sm">
          <div className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}