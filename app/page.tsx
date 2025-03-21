"use client";
import Link from "next/link";

const panels = [
  {
    name: "agent",
    href: "/agent",
    imgSrc: "/assets/agent.png",
    description:
      "A collection of weird and interesting things, explored through stories of fantasy, drama, and action.",
  },
  {
    name: "world",
    href: "/world",
    imgSrc: "/assets/world.png",
    description: "I'm a coder",
  },
  {
    name: "traveller",
    href: "/traveller",
    imgSrc: "/assets/traveller.png",
    description:
      "Navigating the world we live in, one little mystery at a time",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      {/* Hello, traveller. */}
      <div className="text-center text-8xl px-3 pb-12 pt-20">
        hello,
        <span className="type-character"> </span>
      </div>

      <div className="flex px-10 items-center gap-2">
        <div>hi</div>

        <div className="p-[6px] gap-7 h-full flex items-start hover:!opacity-100">
          {panels.map(({ name, href, imgSrc, description }) => (
            <Panel
              key={name}
              name={name}
              href={href}
              imgSrc={imgSrc}
              description={description}
            />
          ))}
        </div>
        <div>hi</div>
      </div>
    </div>
  );
}

interface PanelProps {
  name: string;
  href: string;
  imgSrc: string;
  description: string;
}

const Panel = ({ name, href, imgSrc, description }: PanelProps) => {
  return (
    <Link
      key={name}
      href={href}
      className="group grid items-center align-middle w-1/3 h-full hover:bg-stone-800 hover:text-4xl duration-700 border border-1 border-zinc-700 outline outline-1 outline-offset-[6px] outline-zinc-800 text-white text-3xl rounded-3xl p-4 text-center cursor-pointer gap-2"
    >
      <div className="h-11">{name}</div>
      <div className="!overflow-hidden rounded-xl">
        <img
          src={imgSrc}
          alt={name}
          className="group-hover:!scale-105 duration-700"
        ></img>
      </div>
      <div className="text-base h-16 opacity-0 justify-center items-center text-white group-hover:!opacity-100 duration-700">
        {description}
      </div>
    </Link>
  );
};
