"use server";

import { redirect } from "next/navigation";
import { checkPassword, createSession, deleteSession } from "./session";

export type LoginState = { error: string } | null;

export async function login(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || !checkPassword(password)) {
    return { error: "Wrong password." };
  }

  await createSession();
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
