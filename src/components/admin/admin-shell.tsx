"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LogOut,
  Shield,
  Users,
  Building2,
  Target,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/users", label: "Users", icon: Users },
  { href: "/admin/dashboard/teams", label: "Teams", icon: Building2 },
  { href: "/admin/dashboard/leads", label: "Leads", icon: Target },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 flex-col border-r bg-slate-900 text-white">
        <div className="flex items-center gap-3 border-b border-slate-700 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20">
            <Shield className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">Trowas Admin</p>
            <p className="text-xs text-slate-400">Management Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin/dashboard"
                ? pathname === item.href
                : pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-amber-500/20 text-amber-300"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b bg-white px-8 py-4">
          <h1 className="text-lg font-semibold text-slate-900">
            Admin Dashboard
          </h1>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
