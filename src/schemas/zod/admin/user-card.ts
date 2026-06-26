import { z } from "zod";

const emailDataSchema = z.object({
  to: z.array(z.string()).optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
  sendAfterHour: z.string().optional(),
  sendAfterMinute: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const AdminUserCardUpdateSchema = z.object({
  cardName: z.string().optional(),
  cardLayout: z
    .enum(["Left Aligned", "Center Aligned", "Portrait"])
    .optional(),
  name: z.string().optional(),
  location: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  call: z.string().nullable().optional(),
  email: z.string().optional(),
  company: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  cardTheme: z.string().optional(),
  linkColor: z.string().optional(),
  matchLinkIconsToTheme: z.boolean().optional(),
  font: z.string().optional(),
  profilePicture: z.string().optional(),
  coverPhoto: z.string().optional(),
  companyLogo: z.string().optional(),
  qrCodeUrl: z.string().optional(),
  links: z.union([z.array(z.unknown()), z.record(z.unknown())]).optional(),
  leadForm: z.unknown().nullable().optional(),
  emailData: emailDataSchema.optional(),
  teamTemplateId: z.string().optional(),
  teamTemplateName: z.string().optional(),
});
