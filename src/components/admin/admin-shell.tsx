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
  UserPlus,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Kontrol Paneli", icon: LayoutDashboard },
  { href: "/admin/dashboard/users", label: "Kullanıcılar", icon: Users },
  { href: "/admin/dashboard/register-user", label: "Kullanıcı Kaydet", icon: UserPlus },
  { href: "/admin/dashboard/teams", label: "Takımlar", icon: Building2 },
  { href: "/admin/dashboard/leads", label: "Leads", icon: Target },
];

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Kontrol Paneli",
  "/admin/dashboard/users": "Kullanıcılar",
  "/admin/dashboard/register-user": "Kullanıcı Kaydet",
  "/admin/dashboard/teams": "Takımlar",
  "/admin/dashboard/leads": "Leads",
};

function getPageTitle(pathname: string | null) {
  if (!pathname) return "Rol Card Yönetim Paneli";

  if (pathname.startsWith("/admin/dashboard/users/")) {
    return "Kullanıcı Detayı";
  }
  if (pathname.startsWith("/admin/dashboard/teams/")) {
    return "Takım Detayı";
  }
  if (pathname.startsWith("/admin/dashboard/leads/")) {
    return "Lead Detayı";
  }
  if (pathname.startsWith("/admin/dashboard/subteams/")) {
    return "Alt Takım Detayı";
  }

  return pageTitles[pathname] ?? "Rol Card Yönetim Paneli";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r bg-slate-900 text-white">
        <div className="flex items-center gap-3 border-b border-slate-700 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20">
            <Shield className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">Rol Card Admin</p>
            <p className="text-xs text-slate-400">Yönetim Portalı</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
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
            Çıkış Yap
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b bg-white px-8 py-4">
          <h1 className="text-lg font-semibold text-slate-900">
            {getPageTitle(pathname)}
          </h1>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
