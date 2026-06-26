"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Calendar, Target, User } from "lucide-react";
import { toast } from "sonner";
import { formatLeadFieldValue } from "@/lib/admin/lead-utils";

type LeadDetail = {
  _id: string;
  title: string;
  email?: string;
  phone?: string;
  type?: string;
  leadData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  sendAfter?: string;
  user?: {
    id: string;
    name: string;
    profileImage?: string;
  } | null;
  team?: {
    _id: string;
    name: string;
  } | null;
};

export default function AdminLeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<LeadDetail | null>(null);

  useEffect(() => {
    if (!leadId) return;

    fetch(`/api/admin/leads/${leadId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Lead not found");
        return res.json();
      })
      .then(setLead)
      .catch(() => {
        toast.error("Failed to load lead");
        router.push("/admin/dashboard/leads");
      })
      .finally(() => setLoading(false));
  }, [leadId, router]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading lead details...
      </div>
    );
  }

  if (!lead) return null;

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const leadDataEntries = Object.entries(lead.leadData || {}).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link href="/admin/dashboard/leads">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Link>
      </Button>

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50">
          <Target className="h-7 w-7 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{lead.title}</h2>
          <p className="mt-1 font-mono text-xs text-slate-400">
            ID: {lead._id}
          </p>
          {lead.type && (
            <p className="mt-1 text-sm text-slate-600">Type: {lead.type}</p>
          )}
          <p className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            Read-only view
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-1">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Summary</h3>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {lead.email || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {lead.phone || "—"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                Created
              </dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {formatDate(lead.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Last Updated</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {formatDate(lead.updatedAt)}
              </dd>
            </div>
            {lead.sendAfter && (
              <div>
                <dt className="text-slate-500">Scheduled Send</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {formatDate(lead.sendAfter)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {lead.user && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <User className="h-5 w-5 text-amber-600" />
                Captured By
              </h3>
              <Link
                href={`/admin/dashboard/users/${lead.user.id}`}
                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-slate-50"
              >
                <Image
                  src={lead.user.profileImage || "/defaultpp.png"}
                  alt={lead.user.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-slate-900">{lead.user.name}</p>
                  <p className="text-sm text-amber-600">View user profile</p>
                </div>
              </Link>
            </div>
          )}

          {lead.team && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Building2 className="h-5 w-5 text-amber-600" />
                Team
              </h3>
              <Link
                href={`/admin/dashboard/teams/${lead.team._id}`}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50"
              >
                <p className="font-medium text-slate-900">{lead.team.name}</p>
                <span className="text-sm text-amber-600">View team</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Lead Data</h3>
        {leadDataEntries.length === 0 ? (
          <p className="text-sm text-slate-500">No lead data fields recorded.</p>
        ) : (
          <div className="divide-y rounded-lg border">
            {leadDataEntries.map(([key, value]) => (
              <div
                key={key}
                className="grid gap-2 p-4 sm:grid-cols-3 sm:gap-4"
              >
                <dt className="text-sm font-medium text-slate-700">{key}</dt>
                <dd className="whitespace-pre-wrap break-words text-sm text-slate-600 sm:col-span-2">
                  {formatLeadFieldValue(value)}
                </dd>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
