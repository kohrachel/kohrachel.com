"use client";

import { useEffect, useRef, useState } from "react";

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

  function moveImageLeftOnScroll() {
    if (imageRef.current === null) return {};

    const imageWidth = imageRef.current.getBoundingClientRect().width;
    return {
      transform: `translateX(${
        (position / window.innerHeight) *
        (window.innerWidth / 2 - imageWidth / 2 - 20)
      }px)`,
    };
  }
  function makeTextAppearOnScroll() {
    if (imageRef.current === null) return {};

    return {
      opacity: `${-position / window.innerHeight}`,
    };
  }

  return (
    <div className="h-[100vh] relative w-screen flex justify-center">
      <div ref={scrollHelperRef} className="absolute h-[200vh] w-screen" />
      <img
        ref={imageRef}
        src="/assets/water.jpg"
        alt="water ebbs and flows as waves crash to shore, close up"
        className="h-full object-contain fixed"
        style={moveImageLeftOnScroll()}
      />
      <div
        className="flex flex-col h-max w-max p-9 ml-9 rounded-3xl fixed bg-yellow-300"
        style={makeTextAppearOnScroll()}
      >
        <div className="flex items-end gap-1">
          <p className="font-serif font-semibold italic text-8xl">rachel</p>
          <p className="pb-2 text-xl">(n.)</p>
        </div>
        <ol className="list-decimal text-xl">
          <li>ewe, female sheep</li>
          <li>modern idiot</li>
        </ol>
      </div>
    </div>
  );

  //   based on scroll position, move the position of the div below
  //   return (
  //     <div className="h-[200vh] w-screen flex">
  //       {/* TODO: make this default to center on render, and move it to left on scroll */}
  //       <div className="flex items-center h-[100vh]" ref={parentRef}>
  //         <SpotlightImage scrollPosition={-position} />
  //         {/* <div className="flex flex-col h-max w-max p-9 ml-9 rounded-3xl bg-yellow-300">
  //           <div className="flex items-end gap-1">
  //             <p className="font-serif font-semibold italic text-8xl">rachel</p>
  //             <p className="pb-2 text-xl">(n.)</p>
  //           </div>
  //           <ol className="list-decimal text-xl">
  //             <li>ewe, female sheep</li>
  //             <li>modern idiot</li>
  //           </ol>
  //         </div> */}
  //       </div>
  //     </div>

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
