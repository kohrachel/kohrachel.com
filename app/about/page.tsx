export default function About() {
  return (
    <div className="h-screen w-screen flex justify-center items-center align-middle">
      <img
        src="/assets/water.jpg"
        alt="water ebbs and flows as waves crash to shore, close up"
        className="absolute h-[95%] -z-10"
      ></img>
      <div className="flex flex-col h-max w-max p-9 items-center justify-center rounded-3xl bg-yellow-300">
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
  );
}
