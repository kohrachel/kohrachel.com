"use client";
import { useState } from "react";

type ItemType = "chest" | "gems" | "busted";

const rawMessage = process.env.NEXT_PUBLIC_SECRET_MESSAGE ?? "";
const SECRET_MESSAGE = rawMessage.replace(/\\n/g, "\n");
const GEMS_FOR_SECRET_MESSAGE = 49;
const GEMS_STEP_SIZES = [1, 2, 4, 6, 8, 10];

const INFO_MESSAGES = {
  gems: "You found gems!",
  busted: "BUSTED! You lost half of your gems.",
  chest: "Level up! Earn 2x gems per gem chest!",
};

type InfoMessage = {
  show: boolean;
  item: ItemType;
  message: string;
};

export default function Chocolate() {
  const [showSquare, setShowSquare] = useState<boolean[]>(Array(16).fill(true));
  const [showSecretMessage, setShowSecretMessage] = useState(false);
  const [gems, setGems] = useState(0);
  const [level, setLevel] = useState(0);
  const [infoMessage, setInfoMessage] = useState<InfoMessage>({
    show: false,
    item: "chest",
    message: "",
  });
  const [slideOut, setSlideOut] = useState(false);
  const isSecretMessageButtonDisabled = gems < GEMS_FOR_SECRET_MESSAGE;

  const [items, setItems] = useState<ItemType[]>([
    "chest",
    "gems",
    "busted",
    "chest",
    "busted",
    "chest",
    "chest",
    "gems",
    "gems",
    "busted",
    "chest",
    "chest",
    "chest",
    "chest",
    "gems",
    "busted",
  ]);

  const array = (n: number) => Array.from({ length: n }, (_, index) => index);

  const handleClick = (index: number) => {
    setShowSquare((prev) => [
      ...prev.slice(0, index),
      false,
      ...prev.slice(index + 1),
    ]);

    if (items[index] === "gems") {
      setGems((prev) => prev + GEMS_STEP_SIZES[level]);
    }

    if (items[index] === "chest" && level < GEMS_STEP_SIZES.length - 1) {
      setLevel((prev) => prev + 1);
    }

    if (items[index] === "busted") {
      setGems((prev) => Math.floor(prev / 2));
    }

    setInfoMessage({
      show: true,
      item: items[index],
      message: INFO_MESSAGES[items[index] as keyof typeof INFO_MESSAGES],
    });

    const showSquareTimeout = setTimeout(() => {
      setShowSquare((prev) => [
        ...prev.slice(0, index),
        true,
        ...prev.slice(index + 1),
      ]);
      setInfoMessage({
        show: false,
        item: "chest",
        message: INFO_MESSAGES["chest"],
      });
    }, 1000);

    const changeItemTimeout = setTimeout(() => {
      const rand = Math.random();
      const newItem = rand < 0.25 ? "gems" : rand < 0.5 ? "busted" : "chest";

      setItems((prev) => [
        ...prev.slice(0, index),
        newItem,
        ...prev.slice(index + 1),
      ]);
    }, 1200);

    return () => {
      clearTimeout(showSquareTimeout);
      clearTimeout(changeItemTimeout);
    };
  };

  return (
    <div
      className="h-screen w-screen bg-sky-300 flex flex-col items-center justify-center overflow-hidden"
      style={{ maxWidth: "100vw", maxHeight: "100vh" }}
    >
      <p className="text-black text-2xl font-bold text-center absolute top-28 px-10">
        {slideOut
          ? "Tap the chocolate to find gems and reveal the hidden message!"
          : "Tap the chocolate wrapper to open it!"}
      </p>
      <p className="text-black text-sm text-center absolute top-56 px-10">
        Each gem chest yields{" "}
        <span className="font-bold">{GEMS_STEP_SIZES[level]}</span> gems
      </p>
      <img
        src="/assets/chocolate-wrapper.png"
        alt="chocolate"
        className={`absolute h-80 object-cover z-10 transition-transform duration-500 ease-in-out ${
          slideOut ? "translate-x-full" : ""
        }`}
        onClick={() => {
          setSlideOut((prev) => !prev);
        }}
      />

      <div className="absolute h-72 w-72 p-1 rounded-sm object-cover grid grid-rows-4 grid-cols-4 items-center justify-items-center bg-[#4f2c1c]">
        {items.map((item, index) => (
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
      {infoMessage.show && (
        <div className="absolute bottom-64 text-white px-4 py-2 rounded-md bg-sky-500">
          {infoMessage.message}
        </div>
      )}

      <button
        className={`absolute bottom-20 text-white px-4 py-2 rounded-md ${
          isSecretMessageButtonDisabled ? "bg-gray-400" : "bg-purple-500"
        }`}
        onClick={() =>
          gems >= GEMS_FOR_SECRET_MESSAGE
            ? setShowSecretMessage(true)
            : alert("You do not have enough gems to reveal the hidden message")
        }
      >
        Reveal the hidden message | 49 Gems
      </button>
      <p className="absolute bottom-12 text-black text-sm">
        You have <span className="font-bold">{gems}</span> gems
      </p>

      {showSecretMessage && (
        <div className="absolute h-80 w-80 p-3 rounded-sm bg-sky-300 flex flex-col gap-2 overflow-y-scroll">
          {SECRET_MESSAGE.split("\n").map((paragraph, index) => (
            <p key={index} className="text-black text-sm">
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
