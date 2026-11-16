import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Suspense } from "react";
import { canWrite } from "@/server/auth/gate";
import { PasteFlow } from "./paste-flow";

export const metadata: Metadata = {
  title: "Add · bluebook",
  robots: { index: false },
};

export default function AddPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Add</h1>
      <Suspense fallback={<p className="text-stone-500">Loading…</p>}>
        <OwnerOnly />
      </Suspense>
    </main>
  );
}

async function OwnerOnly() {
  if (await canWrite()) return <PasteFlow />;
  return (
    <p>
      Only the owner can add links.{" "}
      <Link href={await loginUrl()} className="underline">
        Log in
      </Link>
    </p>
  );
}

/**
 * The login page is on the main site. On `bluebook.kohrachel.com` that's
 * another host; on a Vercel preview, bluebook lives at `/bluebook` on the
 * same host.
 */
async function loginUrl() {
  const host = (await headers()).get("host") ?? "";
  return host.startsWith("bluebook.")
    ? `https://${host.slice("bluebook.".length)}/admin/login`
    : "/admin/login";
}
