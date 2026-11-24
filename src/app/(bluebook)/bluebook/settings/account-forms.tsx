"use client";

import { useActionState, useState } from "react";
import {
  DISPLAY_NAME_MAX,
  PASSWORD_MAX,
  PASSWORD_MIN,
  USERNAME_MAX,
} from "@/domain-types/bluebook/auth";
import { changePassword, updateProfile } from "@/server/bluebook/auth/actions";
import type { Person } from "../byline";
import { Notice } from "../notice";
import { SignatureSample } from "../signature-sample";

/** Your display name and username, with the signature as it will look. */
export function ProfileForm({ user }: { user: Person & { username: string } }) {
  const [state, action, pending] = useActionState(updateProfile, null);
  const [displayName, setDisplayName] = useState(user.displayName);
  const failed = state && !state.saved ? state : null;

  return (
    <form action={action} className="bb-form">
      <SignatureSample
        person={{ id: user.id, displayName: displayName.trim() || "Your name" }}
      />
      <Field
        label="Display name"
        hint="The name on your entries. Changing it re-signs everything you wrote."
      >
        <input
          name="displayName"
          autoComplete="nickname"
          required
          maxLength={DISPLAY_NAME_MAX}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="bb-input"
        />
      </Field>
      <Field label="Username" hint="For signing in. Letters, numbers, _ and -.">
        <input
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={USERNAME_MAX}
          pattern={"[A-Za-z0-9_\\-]+"}
          defaultValue={failed?.values?.username ?? user.username}
          className="bb-input"
        />
      </Field>
      {failed && <Notice kind="error" title={failed.error} />}
      <div className="bb-row">
        <button
          type="submit"
          disabled={pending}
          className="bb-btn bb-btn--primary"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {state?.saved && !pending && (
          <span className="bb-hint" role="status">
            Saved.
          </span>
        )}
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  const failed = state && !state.saved ? state : null;

  return (
    <form action={action} className="bb-form">
      <Field label="Current password">
        <input
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          required
          maxLength={PASSWORD_MAX}
          className="bb-input"
        />
      </Field>
      <div className="bb-form__pair">
        <Field
          label="New password"
          hint={`At least ${PASSWORD_MIN} characters.`}
        >
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN}
            maxLength={PASSWORD_MAX}
            className="bb-input"
          />
        </Field>
        <Field label="New password again">
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            maxLength={PASSWORD_MAX}
            className="bb-input"
          />
        </Field>
      </div>
      {failed && <Notice kind="error" title={failed.error} />}
      <div className="bb-row">
        <button
          type="submit"
          disabled={pending}
          className="bb-btn bb-btn--outline"
        >
          {pending ? "Saving…" : "Change password"}
        </button>
        {state?.saved && !pending && (
          <span className="bb-hint" role="status">
            Password changed.
          </span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="bb-field">
      <span className="bb-field__head">
        <span className="bb-label">{label}</span>
      </span>
      {children}
      {hint && <span className="bb-hint">{hint}</span>}
    </label>
  );
}
