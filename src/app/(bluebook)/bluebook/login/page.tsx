import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/server/bluebook/auth/actions";
import { sessionUser } from "@/server/bluebook/auth/gate";
import { bluebookBasePath } from "@/server/bluebook/paths";
import { Byline } from "../byline";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in · bluebook",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <main className="bb-page bb-page--account">
      <Suspense fallback={<h1 className="bb-page-title">Sign in</h1>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}

async function LoginContent() {
  const basePath = await bluebookBasePath();
  const user = await sessionUser();
  return (
    <>
      <Link href={basePath || "/"} className="bb-wordmark">
        bluebook
      </Link>
      <section className="bb-account">
        <span aria-hidden="true" className="bb-tape bb-tape--top" />
        {user ? (
          <>
            <div className="bb-account__head">
              <h1 className="bb-page-title">Signed in</h1>
              <p className="bb-account__who">
                <Byline person={user} />
                <span className="bb-meta">@{user.username}</span>
              </p>
            </div>
            <form action={signOut} className="bb-row">
              <button type="submit" className="bb-btn bb-btn--outline">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="bb-page-title">Sign in</h1>
            <SignInForm />
          </>
        )}
      </section>
    </>
  );
}
