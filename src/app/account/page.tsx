"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useUserStore } from "@/store/user-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Api } from "@/lib/api";
import { toast } from "sonner";
import { Lock, Mail, User } from "lucide-react";
import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function AccountPage() {
  const { user, fetchUser, isLoading } = useUserStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) {
      toast.error("Unable to verify your account.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      await Api.post("/auth/password/reset", {
        email: user.email,
        password,
        confirmPassword,
      });
      toast.success("Password updated successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.details?.[0]?.message ||
        "Failed to update password.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !user) {
    return <PageSkeleton variant="simple" />;
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part: string) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="min-h-full bg-gradient-to-b from-[#fafafa] to-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View your account details and update your password.
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border border-[#ececec] shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Account Information</CardTitle>
              <CardDescription>Your profile details on Trowas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white shadow-sm">
                  <Image
                    src={user?.profileImage || "/defaultpp.png"}
                    alt={user?.name || "Profile"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="truncate font-medium">{user?.name || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="truncate font-medium">{user?.email || "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-muted-foreground shadow-inner sm:flex">
                  {initials}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#ececec] shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-4 w-4" />
                Change Password
              </CardTitle>
              <CardDescription>
                Use at least 8 characters with a letter, number, and special character.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
