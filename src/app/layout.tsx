"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarNav } from "../components/sidebar-nav";
import { SidebarProvider } from "../components/ui/sidebar";
import { usePathname } from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import "sonner/dist/styles.css";
import { isMarketingRoute } from "@/lib/webflow/marketing-routes";
import { NavigationProgress } from "@/components/navigation-progress";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.includes("/auth/");
  const isAdminRoute = pathname?.startsWith("/admin");
  const isMarketing = isMarketingRoute(pathname);
  const [client] = useState<QueryClient>(() => new QueryClient());

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[rgba(0,0,0,0.03)]`}>
        <QueryClientProvider client={client}>
          <TooltipProvider delayDuration={200}>
          <NavigationProgress />
          {isAuthRoute ||
          isAdminRoute ||
          pathname.includes("/connect/") ||
          isMarketing ? (
            // Auth, connect, and marketing routes - no sidebar
            <main className="w-full h-full">{children}</main>
          ) : (
            // Protected routes - with sidebar
            <SidebarProvider>
              <div className="w-full h-full flex">
                <SidebarNav />
                <main className="flex-1 w-full overflow-y-auto">
                  {children}
                </main>
              </div>
            </SidebarProvider>
          )}
          <Toaster position="top-right" expand={true} richColors />
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
