"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-max w-full flex flex-col">
      {/* First panel */}
      <div className="h-screen flex">
        {/* L: About me */}
        <div className="flex flex-col items-center justify-start w-full gap-6 mt-32">
          <p className="text-stone-900 text-3xl uppercase">Hi, I'm</p>

          <p className="text-stone-900 font-serif font-bold text-9xl italic">
            Rachel Koh
          </p>
          <p className="text-stone-900text-xl">
            I'm a software engineer. I do full-stack development.
          </p>

          {/* Pinned Projects */}
          <p className="text-stone-900 text-xl font-serif font-semibold italic mt-4">
            what I've been up to lately:
          </p>
          <Projects />

          {/* Socials */}
          <p className="text-stone-900 text-xl font-serif font-semibold italic mt-4">
            socials:
          </p>
          <Socials />
        </div>

        {/* R: Image */}
        <div className="w-1/2 flex flex-col items-start justify-center w-max-content px-5">
          <Link href="/about">
            <div className="overflow-hidden relative rounded-3xl outline-[6px] outline-purple-100 outline-dotted outline-offset-8 hover:outline-purple-300 hover:outline-offset-[12px] hover:outline-8 transition-all duration-500">
              <img
                src="/assets/hello.jpg"
                alt="hello"
                className="w-96 min-h-content hover:outline-stone-100 transition-all duration-500 hover:scale-105"
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Second panel */}
      {/* <div className="h-screen bg-pink-100">
        <p className="text-stone-900 text-3xl font-serif font-bold italic">
          hi i'm the second panel. rachel hasn't built me yet.
        </p>
      </div> */}
    </div>
  );
}

const Projects = () => {
  return (
    <div className="grid grid-cols-2 gap-4 w-max-content max-w-3xl">
      {pins.map((project) => (
        <Link
          href={project.href}
          key={project.key}
          className="flex flex-col border border-dashed w-72 rounded-2xl p-4 border-violet-300 hover:bg-purple-100 transition-all duration-500"
          target="_blank"
        >
          <div className="mb-1 flex flex-row gap-2">
            <span>{project.icon}</span>
            <p className="text-stone-900 font-bold">{project.name}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-stone-850 text-sm">{project.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

const Socials = () => {
  const height = "2rem";
  const focusable = "false";
  const fill = "#7c3aed";

  const socials = [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/kohrh/",
      svg: (
        <svg
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 128 128"
          height={height}
          focusable={focusable}
        >
          <path
            fill={fill}
            d="M116 3H12a8.91 8.91 0 0 0-9 8.8v104.42a8.91 8.91 0 0 0 9 8.78h104a8.93 8.93 0 0 0 9-8.81V11.77A8.93 8.93 0 0 0 116 3M39.17 107H21.06V48.73h18.11zm-9-66.21a10.5 10.5 0 1 1 10.49-10.5a10.5 10.5 0 0 1-10.54 10.48zM107 107H88.89V78.65c0-6.75-.12-15.44-9.41-15.44s-10.87 7.36-10.87 15V107H50.53V48.73h17.36v8h.24c2.42-4.58 8.32-9.41 17.13-9.41C103.6 47.28 107 59.35 107 75z"
          />
        </svg>
      ),
    },
    {
      name: "GitHub",
      href: "https://github.com/kohrachel",
      svg: (
        <svg
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          height={height}
          focusable={focusable}
        >
          <path
            fill={fill}
            fillRule="evenodd"
            d="M20.375 8.174c.163-.4.688-1.987-.163-4.137c0 0-1.312-.413-4.3 1.625c-1.25-.35-2.587-.4-3.912-.4c-1.325 0-2.662.05-3.912.4c-2.988-2.05-4.3-1.625-4.3-1.625c-.85 2.15-.325 3.737-.163 4.137C2.612 9.262 2 10.662 2 12.362c0 6.437 4.163 7.887 9.975 7.887c5.813 0 10.025-1.45 10.025-7.887c0-1.7-.613-3.1-1.625-4.188M12 19.024c-4.125 0-7.475-.187-7.475-4.187c0-.95.475-1.85 1.275-2.588c1.338-1.225 3.625-.575 6.2-.575c2.588 0 4.85-.65 6.2.575c.813.738 1.275 1.625 1.275 2.588c0 3.987-3.35 4.187-7.475 4.187m-3.137-6.262c-.825 0-1.5 1-1.5 2.225s.674 2.237 1.5 2.237c.825 0 1.5-1 1.5-2.237c0-1.238-.675-2.225-1.5-2.225m6.275 0c-.825 0-1.5.987-1.5 2.225c0 1.237.675 2.237 1.5 2.237s1.5-1 1.5-2.237c0-1.238-.663-2.225-1.5-2.225"
          />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/rkchell/",
      svg: (
        <svg
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
          height={height}
          focusable={focusable}
        >
          <path
            fill={fill}
            d="M512 378.7c-73.4 0-133.3 59.9-133.3 133.3S438.6 645.3 512 645.3S645.3 585.4 645.3 512S585.4 378.7 512 378.7M911.8 512c0-55.2.5-109.9-2.6-165c-3.1-64-17.7-120.8-64.5-167.6c-46.9-46.9-103.6-61.4-167.6-64.5c-55.2-3.1-109.9-2.6-165-2.6c-55.2 0-109.9-.5-165 2.6c-64 3.1-120.8 17.7-167.6 64.5C132.6 226.3 118.1 283 115 347c-3.1 55.2-2.6 109.9-2.6 165s-.5 109.9 2.6 165c3.1 64 17.7 120.8 64.5 167.6c46.9 46.9 103.6 61.4 167.6 64.5c55.2 3.1 109.9 2.6 165 2.6c55.2 0 109.9.5 165-2.6c64-3.1 120.8-17.7 167.6-64.5c46.9-46.9 61.4-103.6 64.5-167.6c3.2-55.1 2.6-109.8 2.6-165M512 717.1c-113.5 0-205.1-91.6-205.1-205.1S398.5 306.9 512 306.9S717.1 398.5 717.1 512S625.5 717.1 512 717.1m213.5-370.7c-26.5 0-47.9-21.4-47.9-47.9s21.4-47.9 47.9-47.9s47.9 21.4 47.9 47.9a47.84 47.84 0 0 1-47.9 47.9"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-row gap-4">
      {socials.map((social) => (
        <Link
          href={social.href}
          target="_blank"
          key={social.name}
          className="hover:scale-110 transition-all duration-500"
          aria-label={social.name}
        >
          {social.svg}
        </Link>
      ))}
    </div>
  );
};

const pins: {
  key: string;
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "this-website",
    name: "kohrachel.com",
    description: "This website!",
    href: "https://github.com/kohrachel/kohrachel.com",
    icon: (
      <svg
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 512"
        width="24px"
        height="24px"
        focusable="false"
      >
        <path
          fill="#c084fc"
          d="M155.6 17.3C163 3 179.9-3.6 195 1.9L320 47.5l125-45.6c15.1-5.5 32 1.1 39.4 15.4l78.8 152.9c28.8 55.8 10.3 122.3-38.5 156.6L556.1 413l41-15c16.6-6 35 2.5 41 19.1s-2.5 35-19.1 41l-71.1 25.9L476.8 510c-16.6 6.1-35-2.5-41-19.1s2.5-35 19.1-41l41-15-31.3-86.2c-59.4 5.2-116.2-34-130-95.2L320 188.8l-14.6 64.7c-13.8 61.3-70.6 100.4-130 95.2l-31.3 86.2 41 15c16.6 6 25.2 24.4 19.1 41s-24.4 25.2-41 19.1L92.2 484.1 21.1 458.2c-16.6-6.1-25.2-24.4-19.1-41s24.4-25.2 41-19.1l41 15 31.3-86.2C66.5 292.5 48.1 226 76.9 170.2L155.6 17.3zm44 54.4l-27.2 52.8L261.6 157l13.1-57.9L199.6 71.7zm240.9 0L365.4 99.1 378.5 157l89.2-32.5L440.5 71.7z"
        />
      </svg>
    ),
  },
  {
    key: "pet-the-rock",
    name: "Pet the Rock",
    description: "Pet the rock. Big Brother is watching.",
    href: "https://github.com/kohrachel/w1-pet-rock",
    icon: (
      <svg
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        height="24px"
        focusable="false"
      >
        <path
          fill="#c084fc"
          d="M18.618 7.462L6.403 2.085a1.007 1.007 0 0 0-.77-.016a1.002 1.002 0 0 0-.552.537l-3 7a1 1 0 0 0 .525 1.313L9.563 13.9L8.323 17H4v-3H2v8h2v-3h4.323c.823 0 1.552-.494 1.856-1.258l1.222-3.054l3.419 1.465a1 1 0 0 0 1.311-.518l3-6.857a1 1 0 0 0-.513-1.316m1.312 8.91l-1.858-.742l1.998-5l1.858.741z"
        />
      </svg>
    ),
  },
  {
    key: "spin-to-learn",
    name: "Spin-To-Learn",
    description: "Gambling, learning -- what's the difference?",
    href: "https://github.com/zineanteoh/spin-to-learn",
    icon: (
      <svg
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 512"
        width="24px"
        height="24px"
        focusable="false"
      >
        <path
          fill="#c084fc"
          d="M274.9 34.3c-28.1-28.1-73.7-28.1-101.8 0L34.3 173.1c-28.1 28.1-28.1 73.7 0 101.8L173.1 413.7c28.1 28.1 73.7 28.1 101.8 0L413.7 274.9c28.1-28.1 28.1-73.7 0-101.8L274.9 34.3zM200 224a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM96 200a24 24 0 1 1 0 48 24 24 0 1 1 0-48zM224 376a24 24 0 1 1 0-48 24 24 0 1 1 0 48zM352 200a24 24 0 1 1 0 48 24 24 0 1 1 0-48zM224 120a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm96 328c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-114.3 0c11.6 36 3.1 77-25.4 105.5L320 413.8l0 34.2zM480 328a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"
        />
      </svg>
    ),
  },
];
