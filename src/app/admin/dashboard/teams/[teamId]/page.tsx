"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LogoUploadField } from "@/components/admin/logo-upload-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, ChevronRight, Save, Users, Layers } from "lucide-react";
import { toast } from "sonner";

type MemberItem = {
  _id: string;
  name: string;
  email: string;
  username?: string;
  profileImage?: string;
  roles?: { teamRole?: string };
};

type SubTeamItem = {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  memberCount: number;
  owner?: { _id: string; name: string; email: string };
  createdAt?: string;
};

type TeamDetail = {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  owner?: MemberItem;
  members: MemberItem[];
  pendingUsers: MemberItem[];
  subteams: SubTeamItem[];
  teamSettings?: {
    logo?: string;
    customSubdomain?: string;
    isRemoveTrowasBranding?: boolean;
    isEnforceSSOLogin?: boolean;
    isAutoAddEmailDomain?: boolean;
    allowedEmailDomain?: string;
  };
  teamPerformance?: {
    pipelineGenerated?: number;
    leadsCaptured?: number;
  };
};

type FormState = {
  name: string;
  logo: string;
  customSubdomain: string;
  allowedEmailDomain: string;
  isRemoveTrowasBranding: boolean;
  isEnforceSSOLogin: boolean;
  isAutoAddEmailDomain: boolean;
  pipelineGenerated: string;
  leadsCaptured: string;
};

export default function AdminTeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    logo: "",
    customSubdomain: "",
    allowedEmailDomain: "",
    isRemoveTrowasBranding: false,
    isEnforceSSOLogin: false,
    isAutoAddEmailDomain: false,
    pipelineGenerated: "0",
    leadsCaptured: "0",
  });

  useEffect(() => {
    if (!teamId) return;

    fetch(`/api/admin/teams/${teamId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Team not found");
        return res.json();
      })
      .then((data: TeamDetail) => {
        setTeam(data);
        setForm({
          name: data.name || "",
          logo: data.teamSettings?.logo || "",
          customSubdomain: data.teamSettings?.customSubdomain || "",
          allowedEmailDomain: data.teamSettings?.allowedEmailDomain || "",
          isRemoveTrowasBranding:
            data.teamSettings?.isRemoveTrowasBranding ?? false,
          isEnforceSSOLogin: data.teamSettings?.isEnforceSSOLogin ?? false,
          isAutoAddEmailDomain:
            data.teamSettings?.isAutoAddEmailDomain ?? false,
          pipelineGenerated: String(
            data.teamPerformance?.pipelineGenerated ?? 0,
          ),
          leadsCaptured: String(data.teamPerformance?.leadsCaptured ?? 0),
        });
      })
      .catch(() => {
        toast.error("Failed to load team");
        router.push("/admin/dashboard/teams");
      })
      .finally(() => setLoading(false));
  }, [teamId, router]);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("logo", form.logo);
      formData.append("customSubdomain", form.customSubdomain);
      formData.append("allowedEmailDomain", form.allowedEmailDomain);
      formData.append(
        "isRemoveTrowasBranding",
        String(form.isRemoveTrowasBranding),
      );
      formData.append("isEnforceSSOLogin", String(form.isEnforceSSOLogin));
      formData.append(
        "isAutoAddEmailDomain",
        String(form.isAutoAddEmailDomain),
      );
      formData.append("pipelineGenerated", form.pipelineGenerated);
      formData.append("leadsCaptured", form.leadsCaptured);
      if (logoFile) formData.append("logoFile", logoFile);

      const res = await fetch(`/api/admin/teams/${teamId}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setTeam(data);
      setForm((prev) => ({
        ...prev,
        logo: data.teamSettings?.logo || prev.logo,
      }));
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
      setLogoFile(null);
      toast.success("Team updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update team",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading team details...
      </div>
    );
  }

  if (!team) return null;

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  const MemberRow = ({ member }: { member: MemberItem }) => (
    <TableRow
      className="cursor-pointer"
      onClick={() => router.push(`/admin/dashboard/users/${member._id}`)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Image
            src={member.profileImage || "/defaultpp.png"}
            alt={member.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div>
            <p className="font-medium">{member.name}</p>
            <p className="text-xs text-slate-500">{member.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="capitalize text-slate-600">
        {member.roles?.teamRole || "member"}
      </TableCell>
      <TableCell>
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link href="/admin/dashboard/teams">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams
        </Link>
      </Button>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">{team.name}</h2>
        <p className="mt-1 font-mono text-xs text-slate-400">ID: {team._id}</p>
        {team.owner && (
          <p className="mt-1 text-sm text-slate-600">
            Owner:{" "}
            <Link
              href={`/admin/dashboard/users/${team.owner._id}`}
              className="text-amber-600 hover:underline"
            >
              {team.owner.name} ({team.owner.email})
            </Link>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Team Information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <LogoUploadField
              label="Team Logo"
              value={form.logo}
              preview={logoPreview}
              fileName={logoFile?.name}
              fallbackImage="/defaultcompanylogo.png"
              onUrlChange={(v) => handleChange("logo", v)}
              onFileSelect={(file) => {
                if (!file.type.startsWith("image/")) {
                  toast.error("Please select a valid image file");
                  return;
                }
                if (logoPreview) URL.revokeObjectURL(logoPreview);
                setLogoFile(file);
                setLogoPreview(URL.createObjectURL(file));
              }}
              onClearFile={() => {
                if (logoPreview) URL.revokeObjectURL(logoPreview);
                setLogoPreview(null);
                setLogoFile(null);
              }}
            />
            <div className="space-y-2">
              <Label htmlFor="customSubdomain">Custom Subdomain</Label>
              <Input
                id="customSubdomain"
                value={form.customSubdomain}
                onChange={(e) => handleChange("customSubdomain", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowedEmailDomain">Allowed Email Domain</Label>
              <Input
                id="allowedEmailDomain"
                value={form.allowedEmailDomain}
                onChange={(e) =>
                  handleChange("allowedEmailDomain", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pipelineGenerated">Pipeline Generated</Label>
              <Input
                id="pipelineGenerated"
                type="number"
                value={form.pipelineGenerated}
                onChange={(e) =>
                  handleChange("pipelineGenerated", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadsCaptured">Leads Captured</Label>
              <Input
                id="leadsCaptured"
                type="number"
                value={form.leadsCaptured}
                onChange={(e) => handleChange("leadsCaptured", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(
              [
                ["isRemoveTrowasBranding", "Remove Trowas Branding"],
                ["isEnforceSSOLogin", "Enforce SSO Login"],
                ["isAutoAddEmailDomain", "Auto Add Email Domain"],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <Label>{label}</Label>
                <Switch
                  checked={form[key]}
                  onCheckedChange={(v) => handleChange(key, v)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-amber-500 text-slate-900 hover:bg-amber-400"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      <div className="rounded-xl border bg-slate-50 p-6">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-slate-500">Created At</dt>
            <dd className="mt-1 text-sm">{formatDate(team.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Updated At</dt>
            <dd className="mt-1 text-sm">{formatDate(team.updatedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Members</dt>
            <dd className="mt-1 text-sm">{team.members.length}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <Users className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            Team Members ({team.members.length})
          </h3>
        </div>
        {team.members.length === 0 ? (
          <p className="p-6 text-slate-500">No members in this team.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.members.map((m) => (
                <MemberRow key={m._id} member={m} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {team.pendingUsers.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b px-6 py-4">
            <Users className="h-5 w-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900">
              Pending Users ({team.pendingUsers.length})
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.pendingUsers.map((m) => (
                <MemberRow key={m._id} member={m} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <Layers className="h-5 w-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            Sub-teams ({team.subteams.length})
          </h3>
        </div>
        {team.subteams.length === 0 ? (
          <p className="p-6 text-slate-500">No sub-teams for this team.</p>
        ) : (
          <div className="divide-y">
            {team.subteams.map((st) => (
              <button
                key={st._id}
                type="button"
                onClick={() =>
                  router.push(`/admin/dashboard/subteams/${st._id}`)
                }
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  {st.logo ? (
                    <Image
                      src={st.logo}
                      alt={st.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                      <Layers className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{st.name}</p>
                    <p className="line-clamp-1 text-sm text-slate-500">
                      {st.description}
                    </p>
                    <p className="text-xs text-slate-400">
                      {st.memberCount} member{st.memberCount !== 1 ? "s" : ""}
                      {st.owner && ` · Owner: ${st.owner.name}`}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
