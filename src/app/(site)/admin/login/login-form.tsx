"use client";

import { useActionState } from "react";
import { login } from "@/server/auth/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="flex flex-col gap-3" data-not-typeset>
      <label className="flex flex-col gap-1.5 text-sm">
        Password
        <Input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          aria-invalid={state?.error ? true : undefined}
          className="h-9 text-sm"
        />
      </label>
      {state?.error && (
        <p role="alert" className="my-0 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-9 text-sm">
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
