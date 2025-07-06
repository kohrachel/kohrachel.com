"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function About() {
  const scrollHelperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [position, setPosition] = useState<number>(0);

  useEffect(() => {
    const onScroll = () => {
      if (scrollHelperRef.current === null) return;
      const scrollPosition = scrollHelperRef.current.getBoundingClientRect();
      setPosition(scrollPosition.y);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function moveLeftOnScroll() {
    if (imageRef.current === null) return {};

    const imageWidth = imageRef.current.getBoundingClientRect().width;
    return {
      transform: `translateX(${
        (position / window.innerHeight) *
        (window.innerWidth / 2 - imageWidth / 2 - 20)
      }px)`,
    };
  }
  function appearOnScroll(fadeDir: boolean) {
    if (imageRef.current === null) return {};

    if (fadeDir)
      return {
        opacity: `${-position / window.innerHeight}`,
      };

    return {
      opacity: `${1 + position / window.innerHeight}`,
    };
  }

  return (
    <div className="h-[100vh] relative w-screen flex justify-center">
      <div ref={scrollHelperRef} className="absolute h-[200vh] w-screen" />
      <DearReader makeTextAppearOnScroll={appearOnScroll} />
      <div
        className="w-full fixed flex justify-end h-full opacity-0 bg-purple-100"
        style={appearOnScroll(true)}
      >
        <div className="w-2/3 h-full flex py-11 px-6">
          <div
            className="bg-blue-500 w-full h-full rounded-xl"
            style={appearOnScroll(true)}
          >
            <div
              className="flex flex-col font-chn text-[15rem] w-max h-full justify-center text-purple-200"
              style={appearOnScroll(true)}
            >
              <p className="-mb-16 -mt-28">许</p>
              <p className="-my-16">慧</p>
              <p className="-mt-16 -mb-28">琦</p>
            </div>
          </div>
        </div>
      </div>

      <img
        ref={imageRef}
        src="/assets/water.jpg"
        alt="water ebbs and flows as waves crash to shore, close up"
        className="h-full object-contain fixed"
        style={{
          ...moveLeftOnScroll(),
          /* trim 15 % off top & bottom (0 % left/right) */
          clipPath: "inset(3% 0 3% 0 round 20px)",
          WebkitClipPath: "inset(3% 0 3% 0 round 20px)", // Safari
        }}
      />
      <NameCard moveLeftOnScroll={moveLeftOnScroll} />
      <div className="h-[200vh] w-full p-11"></div>
    </div>
  );

  /* taylor swift lover dollhouse (will come back to this sometime) 
    <div className="h-full w-screen">
      <div className="flex h-72 w-screen p-32 relative bg-pink-50">
        <div
          className="absolute inset-x-0 bottom-32 left-72 h-32 bg-yellow-300 w-72"
          style={{
            clipPath: "polygon(0 100%, 0 50%, 50% 0, 100% 50%, 100% 100%)",
          }}
        >
          attic
        </div>
        <div
          className="h-40 bg-blue-400 w-72"
          style={{
            clipPath:
              "polygon(0 100%, 0 30%, 50% 0, 50% 30%, 100% 30%, 100% 100%)",
          }}
        >
          fishbowl room
        </div>
      </div>
    </div> */
}

// interface SpotlightImageProps {
//   scrollPosition: number;
// }

// function SpotlightImage({ scrollPosition }: SpotlightImageProps) {
//   return (
//     <img
//       src="/assets/water.jpg"
//       alt="water ebbs and flows as waves crash to shore, close up"
//       className="absolute h-full w-full object-contain -z-10 ml-8"
//       style={{
//         // transform: `translateX(${({ scrollPosition }) =>
//         //   scrollPosition ? "0" : "-100vw"})`,
//         transform: `translateY(${scrollPosition}px) translateX(${-scrollPosition}px)`,
//       }}
//     ></img>
//   );
// }

function DearReader({
  makeTextAppearOnScroll,
}: {
  makeTextAppearOnScroll: (fadeDir: boolean) => {};
}) {
  return (
    <div>
      <div
        className="fixed flex flex-col justify-center gap-5 w-1/3 h-full p-11 break-words"
        style={makeTextAppearOnScroll(false)}
      >
        <p>Dear Reader,</p>
        <p className="indent-6">
          I was raised in a little sleepy town that peaked even before the
          British Empire did. By all means, I should have settled into that
          slow, steady rhythm of life. I don't know exactly why I didn't.
          Perhaps it was my endlessly precocious nature, or perhaps it was my
          Slytherin desire clawing for more. It doesn't matter. I was a hopeless
          romantic in a land of greige indifference.
        </p>
        <p className="indent-6">
          In 2023, a little university in Nashville sent me a letter. It was
          everything I had ever dreamed of. It was a fleeting sense of the most
          concentrated amount of catharsis I had ever felt telling me that my
          naivety wasn't for nothing. I accepted.
        </p>
        <p className="indent-6">
          It's been a crazy few years, and hopefully I'll be able to continue
          saying that for many many more. In the meantime, I'm going to compile
          this haphazard collage of the things that inspire and excite me. It's
          a little bit of a dumpster fire, but it's <em>my</em> dumpster fire.
          Welcome to the gang, I'm so glad you're here.
        </p>
        <div className="flex gap-2">
          <p>Love,</p>
          <p className="font-serif italic font-semibold">r.k.</p>
        </div>
      </div>
    </div>
  );
}

function NameCard({ moveLeftOnScroll }: { moveLeftOnScroll: () => {} }) {
  return (
    <div
      className="flex h-max py-7 px-12 rounded-3xl fixed mt-72 backdrop-blur-sm shadow-lg text-white outline-1 outline-blue-200 outline outline-offset-4"
      style={{
        ...moveLeftOnScroll(),
      }}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-end gap-1">
          <p className="font-serif font-semibold italic text-9xl">rachel</p>
          <p className="pb-2 text-xl font-serif">(n.)</p>
        </div>
        <ol className="list-decimal text-xl">
          <li>
            ewe, female{" "}
            <Link
              href=""
              className="underline underline-offset-4 decoration-1 hover:text-purple-300 hover:underline-offset-[5px] duration-300"
            >
              sheep
            </Link>
          </li>
          <li>
            <Link
              href="https://www.youtube.com/watch?v=isF2CTDlIkc"
              className="underline underline-offset-4 decoration-1 hover:text-purple-300 hover:underline-offset-[5px] duration-300"
            >
              modern idiot
            </Link>
            , evermore
          </li>
          <li>
            <Link
              href=""
              className="underline underline-offset-4 decoration-1 hover:text-purple-300 hover:underline-offset-[5px] duration-300"
            >
              matcha
            </Link>{" "}
            lover
          </li>
        </ol>
      </div>
    </div>
  );
}
