"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ChevronRight, Save, Users } from "lucide-react";
import { toast } from "sonner";
import { LogoUploadField } from "@/components/admin/logo-upload-field";
import { SubteamRestrictionsPanel } from "@/components/admin/subteam-restrictions-panel";
import { SubteamMembersEditor } from "@/components/admin/subteam-members-editor";

type MemberItem = {
  _id: string;
  name: string;
  email: string;
  username?: string;
  profileImage?: string;
  roles?: { teamRole?: string };
};

type SubTeamDetail = {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  permissions?: string;
  createdAt?: string;
  owner?: MemberItem;
  parentTeam?: { _id: string; name: string };
  admins?: MemberItem[];
  members: MemberItem[];
  availableMembers: MemberItem[];
  memberCount: number;
};

type FormState = {
  name: string;
  description: string;
  logo: string;
  permissions: string;
};

export default function AdminSubTeamDetailPage() {
  const { subTeamId } = useParams<{ subTeamId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [subteam, setSubteam] = useState<SubTeamDetail | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    logo: "",
    permissions: "0",
  });

  useEffect(() => {
    if (!subTeamId) return;

    fetch(`/api/admin/subteams/${subTeamId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Sub-team not found");
        return res.json();
      })
      .then((data: SubTeamDetail) => {
        setSubteam(data);
        setForm({
          name: data.name || "",
          description: data.description || "",
          logo: data.logo || "",
          permissions: data.permissions || "0",
        });
      })
      .catch(() => {
        toast.error("Failed to load sub-team");
        router.push("/admin/dashboard/teams");
      })
      .finally(() => setLoading(false));
  }, [subTeamId, router]);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("logo", form.logo);
      formData.append("permissions", form.permissions);
      if (logoFile) formData.append("logoFile", logoFile);

      const res = await fetch(`/api/admin/subteams/${subTeamId}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setSubteam(data);
      setForm((prev) => ({
        ...prev,
        logo: data.logo || prev.logo,
        permissions: data.permissions || prev.permissions,
      }));
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
      setLogoFile(null);
      toast.success("Sub-team updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update sub-team",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading sub-team details...
      </div>
    );
  }

  if (!subteam) return null;

  const parentTeamId = subteam.parentTeam?._id;
  const backHref = parentTeamId
    ? `/admin/dashboard/teams/${parentTeamId}`
    : "/admin/dashboard/teams";

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link href={backHref}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Team
        </Link>
      </Button>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">{subteam.name}</h2>
        <p className="mt-1 font-mono text-xs text-slate-400">
          ID: {subteam._id}
        </p>
        {subteam.parentTeam && (
          <p className="mt-1 text-sm text-slate-600">
            Parent Team:{" "}
            <Link
              href={`/admin/dashboard/teams/${subteam.parentTeam._id}`}
              className="text-amber-600 hover:underline"
            >
              {subteam.parentTeam.name}
            </Link>
          </p>
        )}
        {subteam.owner && (
          <p className="mt-1 text-sm text-slate-600">
            Owner:{" "}
            <Link
              href={`/admin/dashboard/users/${subteam.owner._id}`}
              className="text-amber-600 hover:underline"
            >
              {subteam.owner.name} ({subteam.owner.email})
            </Link>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Sub-team Information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <LogoUploadField
              label="Sub-team Logo"
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <SubteamRestrictionsPanel
            permissions={form.permissions}
            onChange={(value) => handleChange("permissions", value)}
          />
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

      {subteam.admins && subteam.admins.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Sub-team Admins ({subteam.admins.length})
            </h3>
          </div>
          <div className="divide-y">
            {subteam.admins.map((admin) => (
              <button
                key={admin._id}
                type="button"
                onClick={() =>
                  router.push(`/admin/dashboard/users/${admin._id}`)
                }
                className="flex w-full items-center justify-between px-6 py-3 text-left hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={admin.profileImage || "/defaultpp.png"}
                    alt={admin.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{admin.name}</p>
                    <p className="text-xs text-slate-500">{admin.email}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            Members ({subteam.members.length})
          </h3>
        </div>
        <SubteamMembersEditor
          subTeamId={subteam._id}
          members={subteam.members}
          availableMembers={subteam.availableMembers || []}
          onUpdated={({ members, availableMembers }) => {
            setSubteam((prev) =>
              prev
                ? {
                    ...prev,
                    members,
                    availableMembers,
                    memberCount: members.length,
                  }
                : prev,
            );
          }}
        />
      </div>
    </div>
  );
}
