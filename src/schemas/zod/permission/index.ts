import { z } from "zod";
export const PermissionSchema = z.object({
  name: z.string().min(1, "Permission name is required"),
  description: z.string().min(1, "Description is required"),
});
