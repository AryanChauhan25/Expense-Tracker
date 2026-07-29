import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or fewer"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "AUD"] as const;

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  currency: z.enum(CURRENCIES),
});

export type ProfileValues = z.infer<typeof profileSchema>;
