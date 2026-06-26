import { z } from "zod";

export const AdminUserListQuerySchema = z.object({
  search: z.string().optional(),
  accountType: z.enum(["individual", "corporate", "all"]).optional().default("all"),
  userRole: z.enum(["user", "admin", "all"]).optional().default("all"),
  isVipMember: z.enum(["true", "false", "all"]).optional().default("all"),
  sortBy: z
    .enum(["name", "email", "createdAt", "accountType", "username"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const AdminUserUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  username: z.string().min(1, "Username is required").optional(),
  uniqueUrlName: z.string().min(1, "Unique URL name is required").optional(),
  accountType: z.enum(["individual", "corporate"]).optional(),
  isVipMember: z.boolean().optional(),
  isChangePass: z.boolean().optional(),
  profileImage: z.string().optional(),
  userRole: z.enum(["user", "admin"]).optional(),
  teamRole: z
    .enum(["member", "manager", "pending", "owner", "company page"])
    .nullable()
    .optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});
