"use client";

import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePageLoading } from "@/hooks/use-page-loading";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { useUserStore } from "@/store/user-store";
import { useTeamStore } from "@/store/team-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function TeamsSettingsPage() {
  const isLoading = usePageLoading();
  const { user, fetchUser } = useUserStore();
  const { teams, fetchTeam } = useTeamStore();
  const team = user?.team ? teams[user.team] : null;

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [allowedEmailDomain, setAllowedEmailDomain] = useState("");
  const [autoAddMembers, setAutoAddMembers] = useState(false);
  const [enforceSSO, setEnforceSSO] = useState(false);
  const [subteamAdminMgmt, setSubteamAdminMgmt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?.team) fetchTeam(user.team);
  }, [fetchTeam, user]);

  useEffect(() => {
    if (team) {
      setCompanyName(team.name || "");
      setAllowedEmailDomain(team.teamSettings?.allowedEmailDomain || "");
      setAutoAddMembers(team.teamSettings?.autoAddMembers || false);
      setEnforceSSO(team.teamSettings?.enforceSSO || false);
      setSubteamAdminMgmt(team.teamSettings?.subteamAdminMgmt || false);
    }
  }, [team]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    if (!team) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", companyName);
      formData.append("allowedEmailDomain", allowedEmailDomain);
      formData.append("autoAddMembers", autoAddMembers.toString());
      formData.append("enforceSSO", enforceSSO.toString());
      formData.append("subteamAdminMgmt", subteamAdminMgmt.toString());

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      await fetch(`/api/teams/${team._id}/update`, {
        method: "PATCH",
        body: formData,
      });

      await fetchTeam(team._id);
      setLogoFile(null);
    } catch (error) {
      console.error("Failed to save team settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !team) {
    return <PageSkeleton variant="details" />;
  }

  return (
    <div className="h-screen flex items-center justify-center p-4 overflow-hidden">
      <Card className="w-[95%] max-w-[1220px] h-[90vh] max-h-[800px] shadow-sm border-neutral-200">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-medium">Team Settings</CardTitle>
              <CardDescription>
                Manage your team&apos;s identity and settings
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-primary group w-fit">
              Export team data
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 h-[calc(90vh-80px)] max-h-[720px]">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-8 pb-8">
              <div className="space-y-3">
                <label htmlFor="logo" className="text-sm font-medium block">
                  Company logo
                </label>
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-24 h-24 rounded-lg border border-neutral-200 flex items-center justify-center bg-muted/50">
                    <div className="w-16 h-16 flex items-center justify-center">
                      {logoPreview ? (
                        <Image src={logoPreview} alt="Preview Logo" width={64} height={64} />
                      ) : team.teamSettings?.logo ? (
                        <Image src={team.teamSettings.logo} alt="Company Logo" width={64} height={64} />
                      ) : null}
                    </div>
                  </div>
                  <div className="p-4 rounded-md bg-muted/30 flex-1 w-full">
                    <p className="text-sm text-muted-foreground mb-2">
                      Set your company logo to replace the default
                    </p>
                    <label className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 cursor-pointer">
                      <input
                        type="file"
                        id="logo"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleLogoChange}
                      />
                      Upload new logo
                    </label>
                  </div>
                </div>
              </div>

              <Separator className="bg-neutral-100" />

              <div className="space-y-3 max-w-md w-full">
                <label htmlFor="company-name" className="text-sm font-medium">
                  Company name
                </label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-10 bg-[#F7F7F7] border-none"
                />
              </div>

              <Separator className="bg-neutral-100" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Enforce Logging in with SSO</p>
                  <p className="text-sm text-muted-foreground">
                    Require team members to log in via SSO, Microsoft, or Google
                  </p>
                </div>
                <Switch checked={enforceSSO} onCheckedChange={setEnforceSSO} className="data-[state=checked]:bg-primary" />
              </div>

              <Separator className="bg-neutral-100" />

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Auto add members with same email domain
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Automatically add users on login with company domain
                    </p>
                  </div>
                  <Switch checked={autoAddMembers} onCheckedChange={setAutoAddMembers} className="data-[state=checked]:bg-primary" />
                </div>
                <Input
                  value={allowedEmailDomain}
                  onChange={(e) => setAllowedEmailDomain(e.target.value)}
                  className="max-w-md h-10"
                />
              </div>

              <Separator className="bg-neutral-100" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Subteam admin management</p>
                  <p className="text-sm text-muted-foreground">
                    Allow subteam admins to manage their members
                  </p>
                </div>
                <Switch checked={subteamAdminMgmt} onCheckedChange={setSubteamAdminMgmt} className="data-[state=checked]:bg-primary" />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveChanges} disabled={isSaving} className="gap-2">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
