"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Building2, User, Crown, ShieldCheck, Target } from "lucide-react";

type Stats = {
  total: number;
  individual: number;
  corporate: number;
  vip: number;
  admins: number;
  teams: number;
  leads: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Total Users",
      value: stats?.total ?? 0,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Individual",
      value: stats?.individual ?? 0,
      icon: User,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Corporate",
      value: stats?.corporate ?? 0,
      icon: Building2,
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "VIP Members",
      value: stats?.vip ?? 0,
      icon: Crown,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Admin Roles",
      value: stats?.admins ?? 0,
      icon: ShieldCheck,
      color: "text-rose-600 bg-rose-50",
    },
    {
      label: "Teams",
      value: stats?.teams ?? 0,
      icon: Building2,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Leads",
      value: stats?.leads ?? 0,
      icon: Target,
      color: "text-teal-600 bg-teal-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
        <p className="mt-1 text-slate-600">
          Manage and monitor all database records from this portal.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {loading ? "—" : card.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
        <p className="mt-1 text-sm text-slate-600">
          Browse, search, filter, and edit database records.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild className="bg-amber-500 text-slate-900 hover:bg-amber-400">
            <Link href="/admin/dashboard/users">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard/teams">
              <Building2 className="mr-2 h-4 w-4" />
              Manage Teams
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard/leads">
              <Target className="mr-2 h-4 w-4" />
              View Leads
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
