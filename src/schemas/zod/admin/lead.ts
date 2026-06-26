import { z } from "zod";

export const AdminLeadListQuerySchema = z.object({
  search: z.string().optional(),
  teamId: z.string().optional(),
  sortBy: z.enum(["createdAt", "userName", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
