import type { Metadata } from "next";
import { logout } from "@/server/auth/login";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in · bluebook",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-xs flex-col gap-6 p-8">
      <h1>Log in</h1>
      <LoginForm />
      <form action={logout}>
        <button type="submit" className="text-sm underline">
          Log out
        </button>
      </form>
    </main>
  );
}
