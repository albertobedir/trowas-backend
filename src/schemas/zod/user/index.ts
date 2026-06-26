import { z, RefinementCtx } from "zod";
import { BitPerms, hasPermission } from "@/utils/bitwiseperms";

export const cardBodySchema = z
  .object({
    cardName: z.string().max(60).optional(),
    name: z.string().max(60).optional(),
    call: z.string().max(60).optional(),
    email: z.string().max(60).optional(),
    jobTitle: z.string().max(60).nullable().optional(),
    company: z.string().max(60).nullable().optional(),
    location: z.string().max(60).nullable().optional(),
    bio: z.string().max(160).nullable().optional(),
    font: z.string().optional(),
    linkColor: z
      .string()
      .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
      .optional(),
    cardColor: z
      .string()
      .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
      .optional(),
    matchLinkIconsToTheme: z.boolean().optional(),
    links: z.record(z.string()).optional(),
  })
  .partial()
  .default({});

export const userUpdateSchema = z.object({
  name: z.string().trim().optional(),
  email: z
    .string()
    .email("Please provide a valid email")
    .trim()
    .toLowerCase()
    .optional(),
  profileImage: z.string().url().optional(),
});

// FIELD_PERMISSIONS objesini tanımla
const FIELD_PERMISSIONS = {
  name: BitPerms.name,
  cardName: BitPerms.templateName,
  jobTitle: BitPerms.jobTitle,
  company: BitPerms.company,
  location: BitPerms.location,
  bio: BitPerms.bio,
  font: BitPerms.font,
  linkColor: BitPerms.linkColor,
  cardTheme: BitPerms.colorTheme,
  matchLinkIconsToTheme: BitPerms.matchLinkIconsToTheme,
  profilePicture: BitPerms.profilePicture,
  coverPhoto: BitPerms.coverPhoto,
  companyLogo: BitPerms.companyLogo,
  links: BitPerms.links,
};

export const UserCardUpdateSchema = z.object({
  teamTemplateId: z.string().optional(),
  name: z.string().optional(),
  cardName: z.string().optional(),
  cardLayout: z.enum(["Left Aligned", "Center Aligned", "Portrait"]).optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  call: z.string().optional(),
  email: z.string().optional(),
  font: z.string().optional(),
  linkColor: z.string().optional(),
  cardTheme: z.string().optional(),
  matchLinkIconsToTheme: z.boolean().optional(),
  profilePicture: z.string().optional(),
  coverPhoto: z.string().optional(),
  companyLogo: z.string().optional(),
  links: z
    .array(
      z.object({
        type: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),
  permission: z.string().nullable(),
});
