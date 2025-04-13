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
          <p className="text-stone-900 text-xl font-serif font-semibold italic">
            what I've been up to lately:
          </p>
          <div className="flex flex-row gap-4">
            {Pins.map((pin) => (
              <Link
                href={pin.href}
                key={pin.key}
                className="flex flex-row gap-2 w-80 border border-dashed rounded-2xl p-3 border-stone-400 hover:bg-purple-100 items-start transition-all duration-500"
                target="_blank"
              >
                {pin.icon}
                <div className="flex flex-col gap-1">
                  <p className="text-stone-900">{pin.name}</p>
                  <p className="text-stone-900 text-sm">{pin.description}</p>
                </div>
              </Link>
            ))}
          </div>
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
      <div className="h-screen bg-stone-600">
        <p>hi i'm the second panel. rachel hasn't built me yet.</p>
      </div>
    </div>
  );
}

const Pins: {
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
      >
        <path
          fill="#c084fc"
          d="M155.6 17.3C163 3 179.9-3.6 195 1.9L320 47.5l125-45.6c15.1-5.5 32 1.1 39.4 15.4l78.8 152.9c28.8 55.8 10.3 122.3-38.5 156.6L556.1 413l41-15c16.6-6 35 2.5 41 19.1s-2.5 35-19.1 41l-71.1 25.9L476.8 510c-16.6 6.1-35-2.5-41-19.1s2.5-35 19.1-41l41-15-31.3-86.2c-59.4 5.2-116.2-34-130-95.2L320 188.8l-14.6 64.7c-13.8 61.3-70.6 100.4-130 95.2l-31.3 86.2 41 15c16.6 6 25.2 24.4 19.1 41s-24.4 25.2-41 19.1L92.2 484.1 21.1 458.2c-16.6-6.1-25.2-24.4-19.1-41s24.4-25.2 41-19.1l41 15 31.3-86.2C66.5 292.5 48.1 226 76.9 170.2L155.6 17.3zm44 54.4l-27.2 52.8L261.6 157l13.1-57.9L199.6 71.7zm240.9 0L365.4 99.1 378.5 157l89.2-32.5L440.5 71.7z"
        />
      </svg>
    ),
  },
  {
    key: "spin-to-learn",
    name: "Spin-To-Learn",
    description: "Gambling? Learning? What's the difference?",
    href: "https://github.com/zineanteoh/spin-to-learn",
    icon: (
      <svg
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 512"
        width="24px"
        height="24px"
      >
        <path
          fill="#c084fc"
          d="M274.9 34.3c-28.1-28.1-73.7-28.1-101.8 0L34.3 173.1c-28.1 28.1-28.1 73.7 0 101.8L173.1 413.7c28.1 28.1 73.7 28.1 101.8 0L413.7 274.9c28.1-28.1 28.1-73.7 0-101.8L274.9 34.3zM200 224a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM96 200a24 24 0 1 1 0 48 24 24 0 1 1 0-48zM224 376a24 24 0 1 1 0-48 24 24 0 1 1 0 48zM352 200a24 24 0 1 1 0 48 24 24 0 1 1 0-48zM224 120a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm96 328c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-114.3 0c11.6 36 3.1 77-25.4 105.5L320 413.8l0 34.2zM480 328a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"
        />
      </svg>
    ),
  },
];
