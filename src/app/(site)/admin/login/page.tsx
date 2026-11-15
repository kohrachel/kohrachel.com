import type { Metadata } from "next";
import { logout } from "@/server/auth/login";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="px-4 pt-(--page-padding-top) pb-(--page-padding-bottom) sm:px-8">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6 rounded-lg bg-stone-900 p-7 sm:p-10">
        <h1 className="my-0">Log in</h1>
        <LoginForm />
        <form action={logout} data-not-typeset>
          <Button type="submit" variant="link" className="h-auto px-0 text-sm">
            Log out
          </Button>
        </form>
      </div>
    </div>
  );
}
