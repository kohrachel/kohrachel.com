"use server";

import { redirect } from "next/navigation";
import {
  setupSchema,
  signInSchema,
  type FormState,
} from "@/domain-types/bluebook/auth";
import {
  createSessionService,
  deleteSessionService,
} from "@/services/bluebook/auth/sessions";
import { finishSetupService } from "@/services/bluebook/auth/setup";
import { signInService } from "@/services/bluebook/auth/sign-in";
import { bluebookBasePath } from "@/server/bluebook/paths";
import {
  clearSessionCookie,
  readSessionToken,
  setSessionCookie,
} from "./cookie";

const WRONG = "Wrong username or password.";

function field(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

async function goHome(): Promise<never> {
  redirect((await bluebookBasePath()) || "/");
}

export async function signIn(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const login = field(formData, "login") ?? "";
  const parsed = signInSchema.safeParse({
    login,
    password: field(formData, "password"),
  });
  if (!parsed.success) return { error: WRONG, values: { login } };

  const result = await signInService(parsed.data.login, parsed.data.password);
  if (!result.ok) return { error: WRONG, values: { login } };

  const session = await createSessionService(result.userId);
  await setSessionCookie(session.token, session.expiresAt);
  return goHome();
}

export async function signOut() {
  const token = await readSessionToken();
  if (token) await deleteSessionService(token);
  await clearSessionCookie();
  return goHome();
}

export async function finishSetup(
  token: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = {
    username: field(formData, "username"),
    displayName: field(formData, "displayName"),
  };
  const echo = Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined),
  ) as Record<string, string>;

  const parsed = setupSchema.safeParse({
    ...values,
    password: field(formData, "password") ?? "",
    confirmPassword: field(formData, "confirmPassword") ?? "",
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid",
      values: echo,
    };
  }

  const result = await finishSetupService(token, parsed.data);
  if (!result.ok) return { error: result.error, values: echo };

  await setSessionCookie(result.token, result.expiresAt);
  return goHome();
}
