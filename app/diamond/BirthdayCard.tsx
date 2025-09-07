export default function BirthdayCard() {
  return (
    <div className="w-full h-screen bg-black text-white">
      <div className="z-10 relative overflow-y-scroll h-full px-20 sm:px-28 md:px-44 lg:px-64 xl:px-80 pt-24 pb-28 sm:py-36 flex flex-col gap-3">
        <p className="font-serif font-semibold text-3xl italic">
          Happy Birthday Mummy!
        </p>
        <p>
          hello i am s ome text can you see me hello i am some text can you see
          me hello i am some text can you see me hello i am some text can you
          see me hello i am some text can you see me hello i am some text can
          you see me{" "}
        </p>
        <p>
          hello i am s ome text can you see me hello i am some text can you see
          me hello i am some text can you see me hello i am some text can you
          see me hello i am some text can you see me hello i am some text can
          you see me{" "}
        </p>
        <p>
          hello i am s ome text can you see me hello i am some text can you see
          me hello i am some text can you see me hello i am some text can you
          see me hello i am some text can you see me hello i am some text can
          you see me{" "}
        </p>
        <p>
          hello i am s ome text can you see me hello i am some text can you see
          me hello i am some text can you see me hello i am some text can you
          see me hello i am some text can you see me hello i am some text can
          you see me{" "}
        </p>
        <p>
          hello i am s ome text can you see me hello i am some text can you see
          me hello i am some text can you see me hello i am some text can you
          see me hello i am some text can you see me hello i am some text can
          you see me{" "}
        </p>
        <p className="font-serif font-semibold italic text-xl text-end">
          -- Rachel
        </p>
      </div>
      <div
        className="absolute top-0 h-24 w-[95%] z-10"
        style={{
          background:
            "linear-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 1), rgba(0, 0, 0, 1), rgba(255, 255, 255, 0))",
        }}
      ></div>
      <div
        className="absolute bottom-0 h-28 w-[95%] z-10"
        style={{
          background:
            "linear-gradient(rgba(255, 255, 255, 0), rgba(0, 0, 0, 1), rgba(0, 0, 0, 1), rgba(0, 0, 0, 1))",
        }}
      ></div>
      <img
        src="/assets/diamond-star-border-top.png"
        alt="diamonds, stars, and pearls in a cartoon 3d style"
        className="absolute top-0 left-0 w-36 md:w-48 lg:w-72 xl:w-96 z-20"
      />
      <img
        src="/assets/diamond-star-border-bottom.png"
        alt="diamonds, stars, and pearls in a cartoon 3d style"
        className="absolute bottom-0 right-0 w-32 md:w-48 lg:w-72 xl:w-96 z-20"
      />
    </div>
  );
}
