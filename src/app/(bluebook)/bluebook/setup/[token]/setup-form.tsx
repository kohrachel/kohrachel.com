"use client";

import { useActionState, useState } from "react";
import {
  DISPLAY_NAME_MAX,
  PASSWORD_MAX,
  PASSWORD_MIN,
  USERNAME_MAX,
  type FormState,
} from "@/domain-types/bluebook/auth";
import { Avatar } from "../../byline";
import { Notice } from "../../notice";

export function SetupForm({
  action,
  needsProfile,
  suggestedUsername,
  suggestedDisplayName,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  needsProfile: boolean;
  suggestedUsername: string;
  suggestedDisplayName: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [displayName, setDisplayName] = useState(suggestedDisplayName);
  const signature = displayName.trim() || "Your name";

  return (
    <form action={formAction} className="bb-form">
      {needsProfile && (
        <>
          <div className="bb-sheet bb-sheet--sample" aria-hidden="true">
            <div className="bb-entry">
              <div className="bb-entry__date">
                <span className="bb-stamp">TODAY</span>
              </div>
              <p className="bb-entry__by">
                <span className="bb-by">
                  <Avatar person={{ id: 0, displayName: signature }} plain />
                  <span className="bb-by__name">{signature}</span>
                </span>
              </p>
              <p className="bb-entry__text bb-entry__text--empty">
                How your entries are signed.
              </p>
            </div>
          </div>
          <Field label="Display name" hint="The name on your entries.">
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
          <Field
            label="Username"
            hint="For signing in. Letters, numbers, _ and -."
          >
            <input
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              maxLength={USERNAME_MAX}
              pattern={"[A-Za-z0-9_\\-]+"}
              defaultValue={state?.values?.username ?? suggestedUsername}
              className="bb-input"
            />
          </Field>
        </>
      )}
      <div className="bb-form__pair">
        <Field label="Password" hint={`At least ${PASSWORD_MIN} characters.`}>
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
        <Field label="Password again">
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
      {state && <Notice kind="error" title={state.error} />}
      <div className="bb-row">
        <button
          type="submit"
          disabled={pending}
          className="bb-btn bb-btn--primary"
        >
          {pending
            ? "Saving…"
            : needsProfile
              ? "Create account"
              : "Save password"}
        </button>
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
