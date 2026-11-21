import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { currentUser } from "@/server/bluebook/auth/gate";
import { bluebookBasePath } from "@/server/bluebook/paths";
import { Notice } from "../notice";
import { PasteFlow } from "./paste-flow";

export const metadata: Metadata = {
  title: "Add · bluebook",
  robots: { index: false },
};

export default function AddPage() {
  return (
    <main className="bb-page bb-page--form">
      <Suspense
        fallback={
          <>
            <h1 className="bb-page-title">Add something</h1>
            <div className="bb-skel" style={{ height: 200 }} />
          </>
        }
      >
        <AddContent />
      </Suspense>
    </main>
  );
}

async function AddContent() {
  const basePath = await bluebookBasePath();
  return (
    <>
      <Link href={basePath || "/"} className="bb-back">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.8} />
        home
      </Link>
      <h1 className="bb-page-title">Add something</h1>
      {(await currentUser()) ? (
        <PasteFlow basePath={basePath} />
      ) : (
        <Notice title="Sign in to add things.">
          <Link href={`${basePath}/login`} className="bb-link">
            Sign in
          </Link>
        </Notice>
      )}
    </>
  );
}
