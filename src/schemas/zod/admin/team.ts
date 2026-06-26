import { z } from "zod";

export const AdminTeamListQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z
    .enum(["name", "createdAt", "memberCount"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const AdminTeamUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  logo: z.string().optional(),
  customSubdomain: z.string().optional(),
  isRemoveTrowasBranding: z.boolean().optional(),
  isEnforceSSOLogin: z.boolean().optional(),
  isAutoAddEmailDomain: z.boolean().optional(),
  allowedEmailDomain: z.string().optional(),
  pipelineGenerated: z.coerce.number().optional(),
  leadsCaptured: z.coerce.number().optional(),
});

export const AdminSubTeamUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  logo: z.string().optional(),
  permissions: z.string().optional(),
});
