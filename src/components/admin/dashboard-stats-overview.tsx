"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Crown,
  CreditCard,
  DollarSign,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  User,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  getSubscriptionSummary,
  recentSubscriptions,
  revenueHistory,
  subscriptionTiers,
  topVipMembers,
} from "@/lib/admin/dashboard-stats";

type LiveStats = {
  total: number;
  individual: number;
  corporate: number;
  vip: number;
  admins: number;
  teams: number;
  leads: number;
};

type DashboardStatsOverviewProps = {
  liveStats: LiveStats | null;
  loading: boolean;
};

const TIER_CHART_COLORS = ["#94a3b8", "#3b82f6", "#7c3aed", "#4f46e5", "#f59e0b"];

function StatCard({
  label,
  value,
  sublabel,
  trend,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sublabel?: string;
  trend?: { value: string; positive: boolean };
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
            {sublabel && (
              <p className="mt-1 text-xs text-slate-500">{sublabel}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  trend.positive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700",
                )}
              >
                {trend.positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {trend.value}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              accent,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    Free: "bg-slate-100 text-slate-700",
    Starter: "bg-blue-50 text-blue-700",
    Pro: "bg-violet-50 text-violet-700",
    Business: "bg-indigo-50 text-indigo-700",
    VIP: "bg-amber-50 text-amber-700",
    "VIP Enterprise": "bg-amber-100 text-amber-800",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[tier] ?? "bg-slate-100 text-slate-700",
      )}
    >
      {tier}
    </span>
  );
}

function StatusBadge({ status }: { status: "active" | "trial" | "past_due" }) {
  const styles = {
    active: "bg-emerald-50 text-emerald-700",
    trial: "bg-sky-50 text-sky-700",
    past_due: "bg-rose-50 text-rose-700",
  };

  const labels = {
    active: "Active",
    trial: "Trial",
    past_due: "Past Due",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

function EventBadge({ type }: { type: "new" | "upgrade" | "renewal" }) {
  const styles = {
    new: "bg-emerald-50 text-emerald-700",
    upgrade: "bg-violet-50 text-violet-700",
    renewal: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[type],
      )}
    >
      {type}
    </span>
  );
}

export function DashboardStatsOverview({
  liveStats,
  loading,
}: DashboardStatsOverviewProps) {
  const summary = getSubscriptionSummary();
  const tierChartData = subscriptionTiers.map((tier) => ({
    name: tier.name,
    value: tier.subscribers,
    revenue: tier.revenue,
  }));

  const revenueKpis = [
    {
      label: "Aylık Yinelenen Gelir",
      value: formatCurrency(summary.mrr),
      sublabel: "Yalnızca ücretli abonelikler",
      trend: { value: "Geçen aya göre +%14,2", positive: true },
      icon: DollarSign,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Yıllık Gelir Tahmini",
      value: formatCurrency(summary.arr),
      sublabel: "Projeksiyon yıllık gelir",
      trend: { value: "Yıllık +%14,2", positive: true },
      icon: TrendingUp,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: "Aktif Aboneler",
      value: loading ? "—" : String(summary.paidSubscribers),
      sublabel: `${summary.totalSubscribers.toLocaleString()} toplam hesap`,
      trend: { value: "Bu ay +%9,8", positive: true },
      icon: CreditCard,
      accent: "bg-violet-50 text-violet-600",
    },
    {
      label: "Ort. Gelir / Kullanıcı",
      value: formatCurrency(summary.arpu),
      sublabel: "Ücretli plan ortalaması",
      trend: { value: "+%3,1", positive: true },
      icon: Sparkles,
      accent: "bg-indigo-50 text-indigo-600",
    },
  ];

  const userKpis = [
    {
      label: "Toplam Kullanıcı",
      value: loading ? "—" : (liveStats?.total ?? 0).toLocaleString(),
      sublabel: "Veritabanından canlı",
      icon: Users,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: "VIP Üyeler",
      value: loading ? "—" : String(liveStats?.vip ?? summary.vipSubscribers),
      sublabel: `${formatCurrency(summary.vipRevenue)} VIP AYG`,
      icon: Crown,
      accent: "bg-amber-50 text-amber-600",
    },
    {
      label: "Kurumsal Hesaplar",
      value: loading ? "—" : (liveStats?.corporate ?? 0).toLocaleString(),
      sublabel: `${loading ? "—" : (liveStats?.individual ?? 0).toLocaleString()} bireysel`,
      icon: Building2,
      accent: "bg-violet-50 text-violet-600",
    },
    {
      label: "Dönüşüm Oranı",
      value: `${summary.conversionRate}%`,
      sublabel: `%${summary.churnRate} aylık kayıp`,
      icon: User,
      accent: "bg-teal-50 text-teal-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <Sparkles className="h-3.5 w-3.5" />
            Abonelik analitiği önizlemesi
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">
            Gelir ve Katman Özeti
          </h2>
          <p className="mt-1 max-w-2xl text-slate-600">
            Katman dağılımı, VIP performansı ve abonelik geliri.
            Abonelik metrikleri örnek veridir; kullanıcı sayıları canlıdır.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Son 30 gün
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {revenueKpis.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {userKpis.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-slate-200 shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle>Gelir Trendi</CardTitle>
            <CardDescription>
              Son 6 ayda AYG ve abone artışı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueHistory}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "revenue" ? formatCurrency(value) : value,
                      name === "revenue" ? "Gelir" : "Aboneler",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Katmanlara Göre Aboneler</CardTitle>
            <CardDescription>Planlar arası kullanıcı payı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {tierChartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={TIER_CHART_COLORS[index % TIER_CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), "Users"]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {subscriptionTiers.map((tier, index) => (
                <div
                  key={tier.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: TIER_CHART_COLORS[index] }}
                    />
                    <span className="text-slate-700">{tier.name}</span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {tier.subscribers.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Katman Performansı</CardTitle>
          <CardDescription>
            Subscribers, revenue, and growth by subscription tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subscriptionTiers} barSize={42}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(v) => v.toLocaleString()}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? formatCurrency(value) : value.toLocaleString(),
                    name === "revenue" ? "Revenue" : "Subscribers",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="subscribers"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  name="subscribers"
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  name="revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {subscriptionTiers.map((tier) => (
              <div
                key={tier.id}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-semibold",
                      tier.bgColor,
                      tier.color,
                    )}
                  >
                    {tier.name}
                  </span>
                  {tier.growth > 0 && (
                    <span className="text-xs font-medium text-emerald-600">
                      +{tier.growth}%
                    </span>
                  )}
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900">
                  {tier.subscribers.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">subscribers</p>
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {tier.price === 0
                      ? "Free"
                      : `${formatCurrency(tier.revenue)}/mo`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {tier.price === 0
                      ? "No direct revenue"
                      : `${formatCurrency(tier.price)} per seat`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <div>
                <CardTitle>En İyi VIP Hesaplar</CardTitle>
                <CardDescription>Highest-value VIP subscribers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topVipMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TierBadge tier={member.tier} />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(member.monthlySpend)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={member.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Son Abonelik Aktivitesi</CardTitle>
            <CardDescription>New signups, upgrades, and renewals</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubscriptions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{item.user}</p>
                        <p className="text-xs text-slate-500">{item.date}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TierBadge tier={item.tier} />
                    </TableCell>
                    <TableCell>
                      <EventBadge type={item.type} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Teams",
            value: loading ? "—" : (liveStats?.teams ?? 0).toLocaleString(),
            icon: Building2,
            color: "text-indigo-600 bg-indigo-50",
          },
          {
            label: "Leads Captured",
            value: loading ? "—" : (liveStats?.leads ?? 0).toLocaleString(),
            icon: Target,
            color: "text-teal-600 bg-teal-50",
          },
          {
            label: "Admin Rolleri",
            value: loading ? "—" : (liveStats?.admins ?? 0).toLocaleString(),
            icon: ShieldCheck,
            color: "text-rose-600 bg-rose-50",
          },
          {
            label: "VIP Share of MRR",
            value: `${Math.round((summary.vipRevenue / summary.mrr) * 100)}%`,
            icon: Crown,
            color: "text-amber-600 bg-amber-50",
          },
        ].map((card) => {
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
                    {card.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    card.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>
            Jump into user, team, and lead management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
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
        </CardContent>
      </Card>
    </div>
  );
}
