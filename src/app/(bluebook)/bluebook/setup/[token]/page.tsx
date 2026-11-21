import type { Metadata } from "next";
import { Suspense } from "react";
import { finishSetup } from "@/server/bluebook/auth/actions";
import { getSetupLink } from "@/server/bluebook/auth/setup-link";
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
    <main className="bb-page bb-page--form">
      <Suspense fallback={<div className="bb-skel" style={{ height: 200 }} />}>
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
  if (!link) {
    return (
      <>
        <h1 className="bb-page-title">Set up</h1>
        <Notice kind="error" title="This link has expired or was already used.">
          Ask for a new one.
        </Notice>
      </>
    );
  }
  return (
    <>
      <h1 className="bb-page-title">
        {link.needsProfile ? "Welcome to bluebook" : "Set a new password"}
      </h1>
      <SetupForm
        action={finishSetup.bind(null, token)}
        needsProfile={link.needsProfile}
        suggestedUsername={link.suggestedUsername}
        suggestedDisplayName={link.suggestedDisplayName}
      />
    </>
  );
}
