"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  BitPerms,
  PermissionGroups,
  getPermissionsByGroup,
} from "@/utils/bitwiseperms";
import { Lock, LockOpen } from "lucide-react";

type RestrictionTab = "about" | "content" | "qrcode" | "settings";

const TAB_DESCRIPTIONS: Record<RestrictionTab, string> = {
  about:
    "Restrict the ability for members to change fields in the about section of their card",
  content: "Restrict the ability for members to manage their content",
  qrcode: "Restrict QR code customization options",
  settings: "Restrict settings and export options",
};

const PERM_LABELS: Record<string, string> = {
  profilePicture: "Profile Picture",
  jobTitle: "Job Title",
  colorTheme: "Color Theme",
  companyLogo: "Company Logo",
  templateName: "Template Name",
  layout: "Layout",
  coverPhoto: "Cover Photo",
  company: "Company",
  location: "Location",
  bio: "Bio",
  name: "Name",
  linkColor: "Link Color",
  matchLinkIconsToTheme: "Match Link Icons to Theme",
  font: "Font",
  links: "Links",
  connectButtonLabel: "Connect Button Label",
  formDisclaimer: "Form Disclaimer",
  allowNonAdminsToUse: "Allow Non-Admins to Use",
  qrcolor: "QR Color",
  qrcustomlogo: "QR Custom Logo",
  exportleadcrm: "Export Lead CRM",
  downloadleads: "Download Leads",
  downloadleadascontact: "Download Lead as Contact",
  exportanalitics: "Export Analytics",
  emailsign: "Email Signature",
  virtualbackground: "Virtual Background",
  createnewcard: "Create New Card",
  switchcard: "Switch Card",
  accountmail: "Account Mail",
  followupmail: "Follow Up Mail",
  text: "Text",
  call: "Call",
  email: "Email",
  contactcard: "Contact Card",
  adress: "Address",
  facetime: "FaceTime",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  youtube: "YouTube",
  twitter: "Twitter",
  tiktok: "TikTok",
  snapchat: "Snapchat",
  twitch: "Twitch",
  pinterest: "Pinterest",
  wechat: "WeChat",
  discord: "Discord",
  telegram: "Telegram",
  thread: "Thread",
  clubhouse: "Clubhouse",
  website: "Website",
  calendly: "Calendly",
  calendlyembed: "Calendly Embed",
  rewiews: "Reviews",
  etsy: "Etsy",
  applimk: "App Link",
  chillpaper: "Chillpaper",
  msbookings: "MS Bookings",
  booksy: "Booksy",
  square: "Square",
  yelp: "Yelp",
  teamdirectory: "Team Directory",
  embedvideo: "Embed Video",
  textsection: "Text Section",
  file: "File",
  dropdown: "Dropdown",
  featured: "Featured",
  customlink: "Custom Link",
  zillow: "Zillow",
  cashapp: "Cash App",
  venmo: "Venmo",
  paypal: "PayPal",
  zelle: "Zelle",
  spotify: "Spotify",
  applemusic: "Apple Music",
  soundcloud: "SoundCloud",
  podcats: "Podcasts",
  poshmark: "Poshmark",
  mediakits: "Media Kits",
  opensea: "OpenSea",
  hoobe: "Hoobe",
  linktree: "Linktree",
};

function permLabel(key: string) {
  return PERM_LABELS[key] || key;
}

function PermissionRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex items-center gap-3">
        {checked ? (
          <Lock className="h-4 w-4 text-slate-500" />
        ) : (
          <LockOpen className="h-4 w-4 text-slate-400" />
        )}
        <Switch checked={checked} onCheckedChange={onToggle} />
      </div>
    </div>
  );
}

export function SubteamRestrictionsPanel({
  permissions,
  onChange,
}: {
  permissions: string;
  onChange: (value: string) => void;
}) {
  const [permissionsres, setPermissionsres] = useState<bigint>(0n);
  const [restrictionTab, setRestrictionTab] =
    useState<RestrictionTab>("about");
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  useEffect(() => {
    try {
      setPermissionsres(BigInt(permissions || "0"));
    } catch {
      setPermissionsres(0n);
    }
  }, [permissions]);

  useEffect(() => {
    const bits = getPermissionsByGroup(restrictionTab);
    setSelectAllChecked(
      bits.length > 0 && bits.every((bit) => (permissionsres & bit) !== 0n),
    );
  }, [restrictionTab, permissionsres]);

  const togglePermission = (perm: bigint) => {
    setPermissionsres((prev) => {
      const next = (prev & perm) !== 0n ? prev & ~perm : prev | perm;
      onChange(next.toString());
      return next;
    });
  };

  const toggleSelectAll = () => {
    const bits = getPermissionsByGroup(restrictionTab);
    setPermissionsres((prev) => {
      const allSet = bits.every((bit) => (prev & bit) !== 0n);
      let next = prev;
      for (const bit of bits) {
        next = allSet ? next & ~bit : next | bit;
      }
      onChange(next.toString());
      return next;
    });
  };

  const tabs: { id: RestrictionTab; label: string }[] = [
    { id: "about", label: "About" },
    { id: "content", label: "Content" },
    { id: "qrcode", label: "QR Code" },
    { id: "settings", label: "Settings" },
  ];

  const keys = PermissionGroups[restrictionTab];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Restrictions</h3>
        <p className="mt-1 text-sm text-slate-500">
          Restrict members from being able to change account settings.
          Restrictions will not be applied to admins.
        </p>
      </div>

      <div className="flex overflow-hidden rounded-lg border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setRestrictionTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              restrictionTab === tab.id
                ? "border-b-2 border-slate-900 bg-white text-slate-900"
                : "bg-slate-50 text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
        {TAB_DESCRIPTIONS[restrictionTab]}
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-white p-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={selectAllChecked}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-slate-300"
          />
          Select all in {tabs.find((t) => t.id === restrictionTab)?.label}
        </label>
        <span className="font-mono text-xs text-slate-400">
          {permissionsres.toString()}
        </span>
      </div>

      <div className="space-y-3">
        {keys.map((key) => (
          <PermissionRow
            key={key}
            label={permLabel(key)}
            checked={(permissionsres & BitPerms[key]) !== 0n}
            onToggle={() => togglePermission(BitPerms[key])}
          />
        ))}
      </div>
    </div>
  );
}
