"use client";

import { useEffect, useState } from "react";
import { DashboardStatsOverview } from "@/components/admin/dashboard-stats-overview";

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

  return <DashboardStatsOverview liveStats={stats} loading={loading} />;
}
