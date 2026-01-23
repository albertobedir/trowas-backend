"use client"

import { PageSkeleton } from "@/components/ui/page-skeleton";
import { usePageLoading } from "@/hooks/use-page-loading";

export default function MailTemplatesPage() {
  const isLoading = usePageLoading();
  
  if (isLoading) {
    return <PageSkeleton variant="simple" />;
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Mail Templates</h1>
      <div className="bg-card rounded-lg p-6">
        <p>Mail templates content goes here</p>
      </div>
    </div>
  );
}