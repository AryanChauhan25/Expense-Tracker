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
  credit_card_limit: z.coerce
    .number({ invalid_type_error: "Credit card limit must be a number" })
    .min(0, "Credit card limit cannot be negative")
    .max(999_999_999.99, "Amount is too large"),
});

export type ProfileValues = z.infer<typeof profileSchema>;
