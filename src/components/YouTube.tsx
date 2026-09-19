import Link from "next/link";
import { VIDEOS } from "@/lib/constants/videos";
import type { VideoType } from "@/domain-types/ui/videos";

const ANIM_NAME = "videoScroll";
const SECONDS_PER_SLIDE = 4;
const HOLD = 0.72; // fraction of each slide's time it rests before sliding

// Keyframes are built from the slide count: the track holds on slide `i`, then
// slides to `i + 1`. A duplicated first slide sits at the end so looping from
// 100% back to 0% lands on the same frame (seamless).
function buildKeyframes(n: number): string {
  const stops: string[] = [];
  for (let i = 0; i < n; i++) {
    const start = ((i / n) * 100).toFixed(4);
    const holdEnd = (((i + HOLD) / n) * 100).toFixed(4);
    const x = `translateX(-${i * 100}%)`;
    stops.push(`${start}% { transform: ${x}; }`);
    stops.push(`${holdEnd}% { transform: ${x}; }`);
  }
  stops.push(`100% { transform: translateX(-${n * 100}%); }`);
  return `@keyframes ${ANIM_NAME} { ${stops.join(" ")} }`;
}

export function YouTube({ kodakFrame }: { kodakFrame: string }) {
  const n = VIDEOS.length;
  const slides = n > 1 ? [...VIDEOS, VIDEOS[0]] : VIDEOS;

  return (
    <article className="lg:col-span-4 relative aspect-836/535 w-full">
      {/* Content aligned to the frame's transparent 16:9 window. */}
      <div className="group absolute left-[6.699%] top-[17.009%] w-[83.971%] h-[73.645%] overflow-hidden">
        {n > 1 ? (
          <>
            <style>{buildKeyframes(n)}</style>
            <div
              className="flex size-full group-hover:paused"
              style={{
                animation: `${ANIM_NAME} ${n * SECONDS_PER_SLIDE}s ease-in-out infinite`,
              }}
            >
              {slides.map((video, idx) => (
                <VideoSlide key={`${video.href}-${idx}`} video={video} />
              ))}
            </div>
          </>
        ) : (
          <VideoSlide video={VIDEOS[0]} />
        )}
      </div>
      {/* Frame overlays the content; its center is transparent. */}
      <img
        src={kodakFrame}
        alt=""
        className="absolute inset-0 size-full pointer-events-none select-none"
      />
    </article>
  );
}

function VideoSlide({ video }: { video: VideoType }) {
  return (
    <Link
      href={video.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block size-full shrink-0 basis-full"
    >
      <img
        className="size-full object-cover"
        src={video.thumbnailSrc}
        alt={video.title}
      />
    </Link>
  );
}
