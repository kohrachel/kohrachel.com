import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/server/bluebook/auth/actions";
import { sessionUser } from "@/server/bluebook/auth/gate";
import { bluebookBasePath } from "@/server/bluebook/paths";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in · bluebook",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <main className="bb-page bb-page--form">
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
      <Link href={basePath || "/"} className="bb-back">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.8} />
        home
      </Link>
      {user ? (
        <>
          <h1 className="bb-page-title">Signed in</h1>
          <div className="bb-form">
            <p className="bb-meta">
              You&apos;re signed in as {user.displayName} (@{user.username}).
            </p>
            <form action={signOut} className="bb-row">
              <button type="submit" className="bb-btn bb-btn--outline">
                Sign out
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          <h1 className="bb-page-title">Sign in</h1>
          <SignInForm />
        </>
      )}
    </>
  );
}
