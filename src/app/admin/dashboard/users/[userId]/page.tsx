"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Upload, X, CreditCard } from "lucide-react";
import { toast } from "sonner";

type UserDetail = {
  _id: string;
  name: string;
  email: string;
  username: string;
  uniqueUrlName: string;
  accountType: "individual" | "corporate";
  isVipMember: boolean;
  isChangePass: boolean;
  profileImage: string;
  email_verified: string | null;
  createdAt: string;
  team?: { _id: string; name: string } | null;
  subTeams?: string[];
  roles?: {
    userRole?: string;
    teamRole?: string | null;
  };
  notifications?: { type: string; message: string; read: boolean }[];
};

type FormState = {
  name: string;
  email: string;
  username: string;
  uniqueUrlName: string;
  accountType: "individual" | "corporate";
  isVipMember: boolean;
  isChangePass: boolean;
  profileImage: string;
  userRole: "user" | "admin";
  teamRole: string;
  password: string;
};

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    username: "",
    uniqueUrlName: "",
    accountType: "corporate",
    isVipMember: false,
    isChangePass: false,
    profileImage: "",
    userRole: "user",
    teamRole: "",
    password: "",
  });

  useEffect(() => {
    if (!userId) return;

    fetch(`/api/admin/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((data: UserDetail) => {
        setUser(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          username: data.username || "",
          uniqueUrlName: data.uniqueUrlName || "",
          accountType: data.accountType || "corporate",
          isVipMember: data.isVipMember ?? false,
          isChangePass: data.isChangePass ?? false,
          profileImage: data.profileImage || "",
          userRole: (data.roles?.userRole as "user" | "admin") || "user",
          teamRole: data.roles?.teamRole || "",
          password: "",
        });
      })
      .catch(() => {
        toast.error("Failed to load user");
        router.push("/admin/dashboard/users");
      })
      .finally(() => setLoading(false));
  }, [userId, router]);

  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
    };
  }, [profilePreview]);

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (profilePreview) URL.revokeObjectURL(profilePreview);

    setProfileImageFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const clearSelectedFile = () => {
    if (profilePreview) URL.revokeObjectURL(profilePreview);
    setProfileImageFile(null);
    setProfilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("username", form.username);
      formData.append("uniqueUrlName", form.uniqueUrlName);
      formData.append("accountType", form.accountType);
      formData.append("isVipMember", String(form.isVipMember));
      formData.append("isChangePass", String(form.isChangePass));
      formData.append("profileImage", form.profileImage);
      formData.append("userRole", form.userRole);
      formData.append("teamRole", form.teamRole || "");
      if (form.password.trim()) {
        formData.append("password", form.password);
      }
      if (profileImageFile) {
        formData.append("profileImageFile", profileImageFile);
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      setUser(data);
      setForm((prev) => ({
        ...prev,
        password: "",
        profileImage: data.profileImage || prev.profileImage,
      }));
      clearSelectedFile();
      toast.success("User updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading user details...
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not verified";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>

      <div className="flex items-start gap-6">
        <Image
          src={profilePreview || form.profileImage || "/defaultpp.png"}
          alt={form.name}
          width={80}
          height={80}
          className="h-20 w-20 rounded-full object-cover ring-2 ring-slate-200"
        />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
          <p className="text-slate-600">{user.email}</p>
          <p className="mt-1 font-mono text-xs text-slate-400">ID: {user._id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Profile Information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uniqueUrlName">Unique URL Name</Label>
              <Input
                id="uniqueUrlName"
                value={form.uniqueUrlName}
                onChange={(e) => handleChange("uniqueUrlName", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="profileImage">Profile Image</Label>
              <Input
                id="profileImage"
                value={form.profileImage}
                onChange={(e) => handleChange("profileImage", e.target.value)}
                placeholder="https://..."
              />
              <div className="flex items-center gap-3 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload from Computer
                </Button>
                {profileImageFile && (
                  <>
                    <span className="text-sm text-slate-500">
                      {profileImageFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearSelectedFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Enter a URL or upload an image from your device. Upload takes
                priority on save.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave blank to keep current password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Account Settings
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select
                value={form.accountType}
                onValueChange={(v) =>
                  handleChange("accountType", v as "individual" | "corporate")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>User Role</Label>
              <Select
                value={form.userRole}
                onValueChange={(v) =>
                  handleChange("userRole", v as "user" | "admin")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Team Role</Label>
              <Select
                value={form.teamRole || "none"}
                onValueChange={(v) =>
                  handleChange("teamRole", v === "none" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No team role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="company page">Company Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>VIP Member</Label>
                <p className="text-xs text-slate-500">
                  Grant VIP status to this user
                </p>
              </div>
              <Switch
                checked={form.isVipMember}
                onCheckedChange={(v) => handleChange("isVipMember", v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>Must Change Password</Label>
                <p className="text-xs text-slate-500">
                  Force password change on next login
                </p>
              </div>
              <Switch
                checked={form.isChangePass}
                onCheckedChange={(v) => handleChange("isChangePass", v)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-slate-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Read-Only Information
          </h3>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-slate-500">Created At</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {formatDate(user.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">
                Email Verified
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {formatDate(user.email_verified)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Team</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {user.team?.name || "No team"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Sub-teams</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {user.subTeams?.length ?? 0}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">
                Notifications
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {user.notifications?.length ?? 0}
              </dd>
            </div>
          </dl>
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

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">User Cards</h3>
              <p className="text-sm text-slate-500">
                View and edit digital business cards for this user
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href={`/admin/dashboard/users/${userId}/cards`}>
              Manage Cards
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
