"use client";
import { useState } from "react";
export default function Chocolate() {
  const [showSquare, setShowSquare] = useState<boolean[]>(Array(16).fill(true));
  const array = (n: number) => Array.from({ length: n }, (_, index) => index);

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
    <div className="h-screen w-screen bg-red-500 flex flex-col items-center justify-center">
      <img
        src="/assets/chocolate-wrapper.png"
        alt="chocolate"
        className="absolute h-80 object-cover"
      />
      <div className="absolute h-72 w-72 p-1 rounded-sm object-cover grid grid-rows-4 grid-cols-4 bg-[#4f2c1c]">
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
    </div>
  );
}
