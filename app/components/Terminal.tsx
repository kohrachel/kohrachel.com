"use client";
import { getFirstWord } from "app/utils";
import React, { useEffect, useRef, useState } from "react";
import { MESSAGES } from "./messages";

export default function Terminal() {
  const [path, setPath] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [messageData, setMessageData] = useState(MESSAGES[messageIndex]);
  const [input, setInput] = useState("");
  const [terminalMessage, setTerminalMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { commandData } = messageData;
    if (messageIndex === 0) {
      if (input.toUpperCase() === "Y") {
        setPath("/believes");
      } else {
        setPath("/disbelieves");
      }
      const nextMessageIndex = messageIndex + 1;
      setMessageIndex(nextMessageIndex);
    } else if (commandData && commandData.has(input)) {
      const response =
        commandData.get(input) ?? `You seem lost. How did you get here?`;

      setTerminalMessage(response);
    } else {
      const commandIterator = commandData?.keys();
      const commandArray = Array.from(commandIterator ?? "");

      let allowedCommands = "";
      commandArray.map((commandWithArgs) => {
        const command = getFirstWord(commandWithArgs);
        allowedCommands += allowedCommands !== "" ? ", " : "";
        return (allowedCommands += command);
      });

      setTerminalMessage(
        `Unrecognized command: ${input}.\nAllowed commands: ${allowedCommands}`
      );
    }

    setInput("");
  };

  useEffect(() => {
    setMessageData(MESSAGES[messageIndex]);
  }, [messageIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      if (messageIndex === 0) return;
      if (!messageData.noActionRequired) return;

      const nextMessageIndex = messageIndex + 1;
      setMessageIndex(nextMessageIndex);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [messageIndex, messageData.noActionRequired]);
  return (
    <div className="w-screen h-screen p-10">
      <div
        className="w-full h-full rounded-xl outline outline-purple-200 shadow-xl shadow-black/30"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Header */}
        <div className="w-full h-[3.5%] bg-purple-200 rounded-t-xl flex flex-row">
          <div className="flex flex-row items-center ml-2 gap-2">
            <span className="h-3 w-3 bg-[#ff5e57] rounded-full" />
            <span className="h-3 w-3 bg-[#febc2c] rounded-full" />
            <span className="h-3 w-3 bg-[#26c93e] rounded-full" />
          </div>
          <div className="w-full h-full flex justify-center items-centertext-sm font-semibold">
            📁 ~{path}
          </div>
        </div>
        {/* Body */}
        <div className="w-full h-[96.5%] bg-purple-100 rounded-b-xl font-mono p-1 gap-3">
          {messageData.message
            .split("\n")
            .map((chunk: string, index: number) => (
              <p key={index} className="mb-3">
                {chunk}
              </p>
            ))}
          {messageData.showInput && (
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                placeholder="type some commands..."
                className="h-6 w-full bg-transparent border-none outline-none mb-3"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
              />
            </form>
          )}
          {terminalMessage.split("\n").map((chunk: string, index: number) => (
            <p key={index} className="mb-3">
              {chunk}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
