"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CreditCard,
  Users,
  Palette,
  Wrench,
  BarChart3,
  Shield,
  Search,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { SupportPageShell } from "@/components/support/support-page-shell";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const docCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Create your account, set up your first card, and share it instantly.",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600",
    articles: [
      "Create and customize your digital business card",
      "Share your card via QR code or link",
      "Update profile photo, cover, and company details",
    ],
  },
  {
    id: "cards",
    title: "Cards & Themes",
    description: "Design beautiful cards with themes, colors, fonts, and layouts.",
    icon: CreditCard,
    color: "bg-violet-50 text-violet-600",
    articles: [
      "Apply and customize card themes",
      "Manage multiple cards from one account",
      "Configure links, bio, and contact fields",
    ],
  },
  {
    id: "team",
    title: "Team & Members",
    description: "Invite teammates, assign templates, and manage subteams.",
    icon: Users,
    color: "bg-emerald-50 text-emerald-600",
    articles: [
      "Invite members by email or CSV import",
      "Assign templates and subteams in bulk",
      "Manage roles and permissions",
    ],
  },
  {
    id: "themes",
    title: "Brand Themes",
    description: "Keep your brand consistent across every team member card.",
    icon: Palette,
    color: "bg-amber-50 text-amber-600",
    articles: [
      "Create reusable brand templates",
      "Control which fields members can edit",
      "Preview themes before publishing",
    ],
  },
  {
    id: "toolkit",
    title: "Networking Toolkit",
    description: "Email signatures, virtual backgrounds, lead forms, and more.",
    icon: Wrench,
    color: "bg-rose-50 text-rose-600",
    articles: [
      "Generate email signatures from your card",
      "Set up lead capture forms",
      "Use virtual backgrounds in video calls",
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Leads",
    description: "Track views, connections, and captured leads in one place.",
    icon: BarChart3,
    color: "bg-cyan-50 text-cyan-600",
    articles: [
      "Understand card views and link taps",
      "Review and export captured leads",
      "Monitor team performance metrics",
    ],
  },
];

const faqItems = [
  {
    question: "How do I create my first digital card?",
    answer:
      "After signing up, go to My Cards or Team > Members, open your profile, and customize your card details. You can update photos, links, and theme settings from the card editor.",
  },
  {
    question: "Can I have more than one card?",
    answer:
      "Yes. Individual accounts can manage multiple cards from the My Cards page. Corporate accounts can create additional cards per member from the member editor.",
  },
  {
    question: "How do QR codes work?",
    answer:
      "Each card includes a unique QR code that links to your connect page. Download it from the card editor and use it on print materials, badges, or presentations.",
  },
  {
    question: "What's the difference between individual and corporate accounts?",
    answer:
      "Individual accounts focus on personal card management. Corporate accounts unlock team features like member invites, subteams, shared templates, and team analytics.",
  },
  {
    question: "How can I contact support?",
    answer:
      "Use the Contact page for direct support requests, or submit a feature suggestion from the Request Suggestion page in the Support menu.",
  },
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(faqItems[0]?.question ?? null);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return docCategories;

    return docCategories.filter(
      (category) =>
        category.title.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query) ||
        category.articles.some((article) =>
          article.toLowerCase().includes(query),
        ),
    );
  }, [searchQuery]);

  return (
    <SupportPageShell
      badge="Documentation"
      title="Everything you need to know"
      subtitle="Browse guides, tutorials, and answers to help you get the most out of Trowas — from your first card to advanced team workflows."
    >
      <div className="mb-8">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation..."
            className="h-11 rounded-full border-black/10 bg-white pl-10 shadow-sm"
          />
        </div>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card
              key={category.id}
              className="group border-black/5 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-black/10 hover:shadow-md"
            >
              <CardContent className="p-5">
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${category.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-black/90">
                  {category.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/55">
                  {category.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {category.articles.map((article) => (
                    <li
                      key={article}
                      className="flex items-start gap-2 text-sm text-black/65"
                    >
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-black/30" />
                      <span>{article}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="mb-10 rounded-2xl border border-dashed border-black/10 bg-white px-6 py-10 text-center">
          <p className="text-sm text-black/55">
            No documentation matched your search. Try a different keyword.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card className="border-black/5 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8fafc] px-3 py-1">
              <Shield className="h-4 w-4 text-black/60" />
              <span className="text-xs font-medium text-black/70">
                Quick links
              </span>
            </div>
            <h2 className="text-xl font-semibold text-black/90">
              Popular resources
            </h2>
            <p className="mt-2 text-sm text-black/55">
              Jump directly to the areas users visit most often.
            </p>
            <div className="mt-5 space-y-3">
              {[
                { label: "Customize your card", href: "/user/cards" },
                { label: "Explore themes", href: "/themes" },
                { label: "View analytics", href: "/analytics" },
                { label: "Open networking toolkit", href: "/toolkit/mail-signature" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl border border-black/5 bg-[#fafafa] px-4 py-3 text-sm font-medium text-black/80 transition-colors hover:border-black/10 hover:bg-white"
                >
                  {item.label}
                  <ArrowUpRight className="h-4 w-4 text-black/35" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/5 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8fafc] px-3 py-1">
              <BookOpen className="h-4 w-4 text-black/60" />
              <span className="text-xs font-medium text-black/70">FAQ</span>
            </div>
            <h2 className="text-xl font-semibold text-black/90">
              Frequently asked questions
            </h2>
            <div className="mt-4 divide-y divide-black/5">
              {faqItems.map((item) => {
                const isOpen = openFaq === item.question;
                return (
                  <Collapsible
                    key={item.question}
                    open={isOpen}
                    onOpenChange={(open) =>
                      setOpenFaq(open ? item.question : null)
                    }
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 py-4 text-left">
                      <span className="text-sm font-medium text-black/85">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-black/40 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-4 text-sm leading-relaxed text-black/55">
                      {item.answer}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden border-0 bg-gradient-to-r from-[#111827] to-[#1e293b] text-white shadow-lg">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-semibold">Still need help?</h3>
            <p className="mt-1 text-sm text-white/70">
              Our support team is ready to help you with setup, billing, or
              product questions.
            </p>
          </div>
          <Button asChild className="rounded-full bg-white text-black hover:bg-white/90">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </CardContent>
      </Card>
    </SupportPageShell>
  );
}
