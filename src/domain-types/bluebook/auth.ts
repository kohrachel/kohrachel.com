import { z } from "zod";

export const SESSION_DAYS = 400;
export const SETUP_LINK_HOURS = 24;
export const MAX_FAILED_SIGN_INS = 10;
export const LOCK_MINUTES = 15;

export const USERNAME_MAX = 30;
export const DISPLAY_NAME_MAX = 50;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 256;

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const usernameSchema = z
  .string()
  .trim()
  .min(1, "Pick a username.")
  .max(USERNAME_MAX, `Usernames are at most ${USERNAME_MAX} characters.`)
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Usernames can only have letters, numbers, _ and -.",
  );

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Pick a display name.")
  .max(
    DISPLAY_NAME_MAX,
    `Display names are at most ${DISPLAY_NAME_MAX} characters.`,
  );

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Passwords need at least ${PASSWORD_MIN} characters.`)
  .max(PASSWORD_MAX, `Passwords are at most ${PASSWORD_MAX} characters.`);

export const signInSchema = z.object({
  login: z.string().trim().min(1).max(320),
  password: z.string().min(1).max(PASSWORD_MAX),
});

export const setupSchema = z
  .object({
    username: usernameSchema.optional(),
    displayName: displayNameSchema.optional(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "The passwords don't match.",
    path: ["confirmPassword"],
  });

export type SetupInput = z.output<typeof setupSchema>;

export type CurrentUser = {
  id: number;
  username: string;
  displayName: string;
  role: UserRole;
};

export type UserRole = "owner" | "admin" | "member";

export type FormState = {
  error: string;
  values?: Record<string, string>;
} | null;
