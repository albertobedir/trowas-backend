import { z } from "zod";

export const AdminLoginSchema = z.object({
  rootNumber: z
    .string()
    .min(1, "Root number is required")
    .regex(/^\d+$/, "Root number must contain only digits"),
  password: z.string().min(1, "Password is required"),
});
