import type { ReactNode } from "react";

/**
 * Full-bleed halftone cloud banner with the title, description and date over
 * the dark sky. Shared by the post page (plain text) and the post editor
 * (text fields in the same slots).
 */
export function PostHeader({
  bannerUrl,
  title,
  description,
  date,
}: {
  bannerUrl: string;
  title: ReactNode;
  /** Omitted (null) when the post has no description. */
  description: ReactNode | null;
  date: ReactNode;
}) {
  return (
    <header
      className="relative h-[33vw] min-h-88 w-full sm:min-h-136"
      data-not-typeset
    >
      <img
        src={bannerUrl}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      {/* Title sits over the dark sky in the upper area. Each line stretches
          to full width (text stays centred) so editor fields can fill it. */}
      <div className="absolute inset-0 flex flex-col items-center justify-start gap-1 px-6 pt-20 text-center text-[#f5f2e8]">
        <h1 className="my-0 self-stretch font-heading text-[clamp(1.6rem,6vw,4.5rem)]! leading-tight text-primary">
          {title}
        </h1>
        {description !== null && (
          <span className="self-stretch font-sans text-[clamp(1rem,2.6vw,1.6rem)] italic">
            {description}
          </span>
        )}
        <span className="font-sans text-[clamp(0.8rem,1.8vw,1.15rem)]">
          {date}
        </span>
      </div>
    </header>
  );
}
