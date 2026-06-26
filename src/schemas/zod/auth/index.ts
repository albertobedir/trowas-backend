import { z } from "zod";

const passwordValidation =
  /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    accountType: z.enum(["individual", "corporate"], {
      required_error: "Account type is required",
    }),
    password: z
      .string()
      .min(4, "Password must be at least 4 characters long")
      .max(20, "Password must be at most 20 characters long")
      .regex(
        passwordValidation,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number or special character"
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
});

export const VerifyDigitCodeSchema = z.object({
  email: z.string().email("Invalid email format"),
  digit_code: z.string().length(6, "Digit code must be exactly 6 digits"),
});

export const ResetPasswordSchema = z
  .object({
    digit_code: z
      .string()
      .length(6, "Digit code must be exactly 6 digits")
      .optional(),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        passwordValidation,
        "Password must contain at least one letter, one number, and one special character"
      ),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
