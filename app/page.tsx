"use client";
import { Mona_Sans } from "next/font/google";
import Image from "next/image";

const panels = [
  {
    name: "agent",
    href: "/agent",
  },
  {
    name: "world",
    href: "/",
  },
  {
    name: "traveller",
    href: "/",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      {/* Hello, traveller. */}
      <div className="text-center text-8xl px-3 py-10">hello, _____</div>

      <div className="p-5 gap-7 h-full flex items-start hover:!opacity-100">
        {panels.map((panel) => (
          <Panel name={panel.name} />
        ))}
      </div>
    </div>
  );
}

const Panel = ({ name }: { name: string }) => {
  return (
    <div
      className="group grid items-center w-1/3 h-full hover:bg-stone-800 hover:text-4xl duration-700 border border-1 border-zinc-700 outline outline-1 outline-offset-[6px] outline-zinc-800 text-white text-3xl rounded-3xl p-4 text-center align-middle cursor-pointer"
      onClick={() => {
        console.log("I was clicked");
      }}
    >
      {name}
      <div className="text-xl opacity-0 justify-center items-center text-white group-hover:!opacity-100 duration-700">
        This is some text you only see if you hover
      </div>
    </div>
  );
};
