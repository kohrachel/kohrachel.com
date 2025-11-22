"use client";
import { useState } from "react";

type ItemType = "chest" | "gems" | "busted";

export default function Chocolate() {
  const [showSquare, setShowSquare] = useState<boolean[]>(Array(16).fill(true));
  const array = (n: number) => Array.from({ length: n }, (_, index) => index);
  const ITEMS: ItemType[] = [
    "chest",
    "chest",
    "chest",
    "chest",
    "gems",
    "gems",
    "gems",
    "gems",
    "busted",
    "busted",
    "busted",
    "busted",
    "chest",
    "chest",
    "chest",
    "chest",
  ];

  const secretMessage = "Happy Birthday!";

  const handleClick = (index: number) => {
    setShowSquare((prev) => [
      ...prev.slice(0, index),
      false,
      ...prev.slice(index + 1),
    ]);

    const timeout = setTimeout(() => {
      setShowSquare((prev) => [
        ...prev.slice(0, index),
        true,
        ...prev.slice(index + 1),
      ]);
    }, 1000);
    return () => clearTimeout(timeout);
  };

  return (
    <div className="h-screen w-screen bg-sky-300 flex flex-col items-center justify-center">
      <p className="text-black text-2xl font-bold text-center absolute top-28 px-10">
        Tap the chocolate to find gems and reveal the hidden message!
      </p>
      <img
        src="/assets/chocolate-wrapper.png"
        alt="chocolate"
        className="absolute h-80 object-cover"
      />

      <div className="absolute h-72 w-72 p-1 rounded-sm object-cover grid grid-rows-4 grid-cols-4 items-center justify-items-center bg-[#4f2c1c]">
        {ITEMS.map((item, index) => (
          <img
            key={index}
            src={`/assets/${item}.png`}
            alt="chocolate"
            className={`max-h-12 max-w-12 object-cover`}
          />
        ))}
      </div>
      <div className="absolute h-72 w-72 p-1 grid grid-rows-4 grid-cols-4">
        {array(16).map((index) => (
          <img
            key={index}
            onClick={() => handleClick(index)}
            src="/assets/chocolate-square.png"
            alt="chocolate"
            className={`object-cover ${
              showSquare[index] ? "opacity-100" : "opacity-0"
            } transition-all duration-300`}
          />
        ))}
      </div>

      <button
        className="absolute bottom-20 bg-purple-500 text-white px-4 py-2 rounded-md"
        onClick={() => {
          alert(`The hidden message is: '${secretMessage}'`);
        }}
      >
        Reveal the hidden message
      </button>

      <div className="absolute h-72 w-72 p-1 rounded-sm bg-yellow-200">
        <p className="text-black text-2xl font-bold text-center">
          {secretMessage}
        </p>
      </div>
    </div>
  );
}
