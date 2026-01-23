import { z } from "zod";

const LinkSchema = z.object({
  type: z.string(),
  url: z.string().url(),
});

const CardTemplateSchema = z.object({
  templateName: z.string(),
  cardLayout: z.enum(["Left Aligned", "Center Aligned", "Portrait"]).default("Left Aligned"),
  profilePicture: z.string().optional(),
  coverPhoto: z.string().optional(),
  companyLogo: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  cardTheme: z.string().optional(),
  linkColor: z.string().optional(),
  matchLinkIconsToTheme: z.boolean().default(false),
  font: z.string().default("Baskerville"),
  links: z.array(LinkSchema).optional(),
  connectButtonLabel: z.string().default("Connect"),
  formDisclaimer: z.string().optional(),
  allowNonAdminsToUse: z.boolean().default(false),
});

export default CardTemplateSchema;
