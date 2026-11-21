import Link from "next/link";
import { bluebookBasePath } from "@/server/bluebook/paths";

export default async function NotFound() {
  const basePath = await bluebookBasePath();
  return (
    <main className="bb-page">
      <div className="bb-empty">
        <span aria-hidden="true" className="bb-tape bb-tape--top" />
        <p className="bb-section-title">That page isn&apos;t in bluebook.</p>
        <Link href={basePath || "/"} className="bb-btn bb-btn--outline">
          Back to bluebook
        </Link>
      </div>
    </main>
  );
}
