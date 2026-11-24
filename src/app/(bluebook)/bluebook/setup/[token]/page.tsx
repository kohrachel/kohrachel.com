import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { finishSetup } from "@/server/bluebook/auth/actions";
import { getSetupLink } from "@/server/bluebook/auth/setup-link";
import { bluebookBasePath } from "@/server/bluebook/paths";
import { Notice } from "../../notice";
import { SetupForm } from "./setup-form";

export const metadata: Metadata = {
  title: "Set up · bluebook",
  robots: { index: false },
};

export default function SetupPage({
  params,
}: PageProps<"/bluebook/setup/[token]">) {
  return (
    <main className="bb-page bb-page--account">
      <Suspense fallback={<div className="bb-skel" style={{ height: 420 }} />}>
        <SetupContent params={params} />
      </Suspense>
    </main>
  );
}

async function SetupContent({
  params,
}: {
  params: PageProps<"/bluebook/setup/[token]">["params"];
}) {
  const { token } = await params;
  const link = await getSetupLink(token);
  const home = (await bluebookBasePath()) || "/";
  const wordmark = (
    <Link href={home} className="bb-wordmark">
      bluebook
    </Link>
  );
  if (!link) {
    return (
      <>
        {wordmark}
        <section className="bb-account">
          <span aria-hidden="true" className="bb-tape bb-tape--top" />
          <h1 className="bb-page-title">Set up</h1>
          <Notice
            kind="error"
            title="This link has expired or was already used."
          >
            Ask for a new one.
          </Notice>
        </section>
      </>
    );
  }
  return (
    <>
      {wordmark}
      <section className="bb-account">
        <span aria-hidden="true" className="bb-tape bb-tape--top" />
        <div className="bb-account__head">
          <h1 className="bb-page-title">
            {link.needsProfile ? "Welcome to bluebook" : "Set a new password"}
          </h1>
          <p className="bb-account__lead">
            {link.needsProfile
              ? "Pick the name you'll sign your entries with, and a password. You only do this once."
              : "Saving signs you out everywhere else and signs you in here."}
          </p>
        </div>
        <SetupForm
          action={finishSetup.bind(null, token)}
          needsProfile={link.needsProfile}
          suggestedUsername={link.suggestedUsername}
          suggestedDisplayName={link.suggestedDisplayName}
        />
      </section>
    </>
  );
}
