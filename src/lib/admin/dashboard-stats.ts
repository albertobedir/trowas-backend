export type SubscriptionTier = {
  id: string;
  name: string;
  price: number;
  billing: "monthly" | "yearly" | "free";
  subscribers: number;
  revenue: number;
  growth: number;
  color: string;
  bgColor: string;
};

export type RevenuePoint = {
  month: string;
  revenue: number;
  subscribers: number;
  mrr: number;
};

export type VipMember = {
  id: string;
  name: string;
  email: string;
  tier: string;
  monthlySpend: number;
  since: string;
  status: "active" | "trial" | "past_due";
};

export type RecentSubscription = {
  id: string;
  user: string;
  email: string;
  tier: string;
  amount: number;
  date: string;
  type: "new" | "upgrade" | "renewal";
};

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    billing: "free",
    subscribers: 1842,
    revenue: 0,
    growth: 4.2,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
  {
    id: "starter",
    name: "Starter",
    price: 9,
    billing: "monthly",
    subscribers: 486,
    revenue: 4374,
    growth: 8.1,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    billing: "monthly",
    subscribers: 312,
    revenue: 9048,
    growth: 12.4,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    id: "business",
    name: "Business",
    price: 79,
    billing: "monthly",
    subscribers: 94,
    revenue: 7426,
    growth: 6.7,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    id: "vip",
    name: "VIP",
    price: 199,
    billing: "monthly",
    subscribers: 38,
    revenue: 7562,
    growth: 18.3,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
];

export const revenueHistory: RevenuePoint[] = [
  { month: "Jan", revenue: 18240, subscribers: 720, mrr: 18240 },
  { month: "Feb", revenue: 19850, subscribers: 758, mrr: 19850 },
  { month: "Mar", revenue: 21420, subscribers: 801, mrr: 21420 },
  { month: "Apr", revenue: 23180, subscribers: 842, mrr: 23180 },
  { month: "May", revenue: 24890, subscribers: 876, mrr: 24890 },
  { month: "Jun", revenue: 28410, subscribers: 930, mrr: 28410 },
];

export const topVipMembers: VipMember[] = [
  {
    id: "1",
    name: "Acme Corp",
    email: "billing@acmecorp.com",
    tier: "VIP Enterprise",
    monthlySpend: 499,
    since: "2024-03-12",
    status: "active",
  },
  {
    id: "2",
    name: "Nova Digital",
    email: "finance@novadigital.io",
    tier: "VIP",
    monthlySpend: 299,
    since: "2024-06-01",
    status: "active",
  },
  {
    id: "3",
    name: "Brightline Agency",
    email: "ops@brightline.co",
    tier: "VIP",
    monthlySpend: 199,
    since: "2024-09-18",
    status: "active",
  },
  {
    id: "4",
    name: "Summit Holdings",
    email: "accounts@summitholdings.com",
    tier: "VIP Enterprise",
    monthlySpend: 499,
    since: "2025-01-05",
    status: "trial",
  },
  {
    id: "5",
    name: "Pulse Marketing",
    email: "hello@pulsemkt.com",
    tier: "VIP",
    monthlySpend: 199,
    since: "2025-02-22",
    status: "active",
  },
];

export const recentSubscriptions: RecentSubscription[] = [
  {
    id: "1",
    user: "Elena Vasquez",
    email: "elena@studio42.com",
    tier: "Pro",
    amount: 29,
    date: "2026-06-25",
    type: "new",
  },
  {
    id: "2",
    user: "Marcus Chen",
    email: "marcus@techflow.io",
    tier: "Business",
    amount: 79,
    date: "2026-06-25",
    type: "upgrade",
  },
  {
    id: "3",
    user: "Sarah Okafor",
    email: "sarah@northwind.agency",
    tier: "VIP",
    amount: 199,
    date: "2026-06-24",
    type: "new",
  },
  {
    id: "4",
    user: "James Whitfield",
    email: "james@whitfield.co",
    tier: "Starter",
    amount: 9,
    date: "2026-06-24",
    type: "renewal",
  },
  {
    id: "5",
    user: "Lina Bergström",
    email: "lina@nordiclabs.se",
    tier: "Pro",
    amount: 29,
    date: "2026-06-23",
    type: "new",
  },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function getSubscriptionSummary() {
  const paidTiers = subscriptionTiers.filter((t) => t.id !== "free");
  const totalSubscribers = subscriptionTiers.reduce(
    (sum, t) => sum + t.subscribers,
    0,
  );
  const paidSubscribers = paidTiers.reduce((sum, t) => sum + t.subscribers, 0);
  const mrr = paidTiers.reduce((sum, t) => sum + t.revenue, 0);
  const arr = mrr * 12;
  const vipRevenue = subscriptionTiers.find((t) => t.id === "vip")?.revenue ?? 0;
  const vipSubscribers =
    subscriptionTiers.find((t) => t.id === "vip")?.subscribers ?? 0;

  return {
    totalSubscribers,
    paidSubscribers,
    mrr,
    arr,
    vipRevenue,
    vipSubscribers,
    churnRate: 2.4,
    conversionRate: 33.6,
    arpu: paidSubscribers > 0 ? Math.round(mrr / paidSubscribers) : 0,
  };
}
