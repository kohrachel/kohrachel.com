"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  changePasswordSchema,
  profileSchema,
  setupSchema,
  signInSchema,
  usernameSchema,
  type AccountFormState,
  type FormState,
  type UsernameCheck,
} from "@/domain-types/bluebook/auth";
import {
  changePasswordService,
  updateProfileService,
  usernameAvailableService,
} from "@/services/bluebook/auth/account";
import {
  createSessionService,
  deleteSessionService,
} from "@/services/bluebook/auth/sessions";
import { finishSetupService } from "@/services/bluebook/auth/setup";
import { signInService } from "@/services/bluebook/auth/sign-in";
import { itemTag } from "@/services/bluebook/items/cache-tags";
import { bluebookBasePath } from "@/server/bluebook/paths";
import {
  clearSessionCookie,
  readSessionToken,
  setSessionCookie,
} from "./cookie";
import { requireMember } from "./gate";

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

export async function updateProfile(
  _state: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const user = await requireMember();
  const values = {
    username: field(formData, "username") ?? "",
    displayName: field(formData, "displayName") ?? "",
  };
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return {
      saved: false,
      error: parsed.error.issues[0]?.message ?? "Invalid",
      values,
    };
  }

  const result = await updateProfileService(user.id, parsed.data);
  if (!result.ok) return { saved: false, error: result.error, values };
  for (const id of result.signedItemIds) updateTag(itemTag(id));
  return { saved: true };
}

export async function checkUsername(username: string): Promise<UsernameCheck> {
  const user = await requireMember();
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    return {
      available: false,
      error: parsed.error.issues[0]?.message ?? "Invalid",
    };
  }
  return usernameAvailableService(user.id, parsed.data);
}

export async function changePassword(
  _state: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const user = await requireMember();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: field(formData, "currentPassword") ?? "",
    password: field(formData, "password") ?? "",
    confirmPassword: field(formData, "confirmPassword") ?? "",
  });
  if (!parsed.success) {
    return {
      saved: false,
      error: parsed.error.issues[0]?.message ?? "Invalid",
    };
  }

  const result = await changePasswordService(
    user.id,
    parsed.data,
    await readSessionToken(),
  );
  return result.ok ? { saved: true } : { saved: false, error: result.error };
}
