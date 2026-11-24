"use client";

import { useActionState } from "react";
import { signIn } from "@/server/bluebook/auth/actions";
import { Notice } from "../notice";

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className="bb-form">
      <label className="bb-field">
        <span className="bb-field__head">
          <span className="bb-label">Username or email</span>
        </span>
        <input
          name="login"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={state?.values?.login}
          className="bb-input"
        />
      </label>
      <label className="bb-field">
        <span className="bb-field__head">
          <span className="bb-label">Password</span>
        </span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          aria-invalid={state ? true : undefined}
          className="bb-input"
        />
      </label>
      {state && <Notice kind="error" title={state.error} />}
      <div className="bb-row">
        <button
          type="submit"
          disabled={pending}
          className="bb-btn bb-btn--primary"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}
