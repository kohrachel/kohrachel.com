import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/server/bluebook/auth/actions";
import { currentUser } from "@/server/bluebook/auth/gate";
import { bluebookBasePath } from "@/server/bluebook/paths";
import { Byline } from "../byline";
import { Notice } from "../notice";
import { SignatureSample } from "../signature-sample";

export const metadata: Metadata = {
  title: "Your account · bluebook",
  robots: { index: false },
};

export default function SettingsPage() {
  return (
    <main className="bb-page bb-page--account">
      <Suspense fallback={<div className="bb-skel" style={{ height: 420 }} />}>
        <SettingsContent />
      </Suspense>
    </main>
  );
}

async function SettingsContent() {
  const basePath = await bluebookBasePath();
  const user = await currentUser();
  return (
    <>
      <Link href={basePath || "/"} className="bb-back">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.8} />
        home
      </Link>
      <h1 className="bb-page-title">Your account</h1>
      {user ? (
        <>
          <section className="bb-account">
            <span aria-hidden="true" className="bb-tape bb-tape--top" />
            <h2 className="bb-section-title">Your name</h2>
            <div className="bb-form">
              <SignatureSample person={user} />
              <label className="bb-field">
                <span className="bb-field__head">
                  <span className="bb-label">Display name</span>
                </span>
                <input
                  value={user.displayName}
                  disabled
                  readOnly
                  className="bb-input"
                />
                <span className="bb-hint">The name on your entries.</span>
              </label>
              <label className="bb-field">
                <span className="bb-field__head">
                  <span className="bb-label">Username</span>
                </span>
                <input
                  value={user.username}
                  disabled
                  readOnly
                  className="bb-input"
                />
                <span className="bb-hint">For signing in.</span>
              </label>
              <p className="bb-account__lead">
                These can&apos;t be changed here yet.
              </p>
            </div>
          </section>
          <section className="bb-account">
            <div className="bb-account__head">
              <h2 className="bb-section-title">Password</h2>
              <p className="bb-account__lead">
                To change it, ask for a reset link.
              </p>
            </div>
          </section>
          <section className="bb-account">
            <div className="bb-account__head">
              <h2 className="bb-section-title">This device</h2>
              <p className="bb-account__who">
                <Byline person={user} />
                <span className="bb-meta">
                  @{user.username} · {user.role}
                </span>
              </p>
            </div>
            <form action={signOut} className="bb-row">
              <button type="submit" className="bb-btn bb-btn--outline">
                Sign out
              </button>
            </form>
          </section>
        </>
      ) : (
        <Notice title="Sign in to see your account.">
          <Link href={`${basePath}/login`} className="bb-link">
            Sign in
          </Link>
        </Notice>
      )}
    </>
  );
}
