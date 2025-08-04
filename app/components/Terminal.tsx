import React, { useState, useEffect } from "react";
import { MESSAGES } from "./messages";

function Terminal() {
  const [path, setPath] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [messageData, setMessageData] = useState(MESSAGES[messageIndex]);
  const [input, setInput] = useState("");
  const [terminalMessage, setTerminalMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (messageIndex === 0) {
      if (input.toUpperCase() === "Y") {
        setPath("/believes");
      } else {
        setPath("/disbelieves");
      }
      const nextMessageIndex = messageIndex + 1;
      setMessageIndex(nextMessageIndex);
    } else if (
      input === "cd" ||
      input === "ls" ||
      input === "open PRIVATE_URL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED"
    ) {
      messageData.terminalResponse?.map(({ command, response }) => {
        command === input && setTerminalMessage(response);
      });
    } else {
      setTerminalMessage("Allowed commands: cd, ls, open");
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

      messageData.noActionRequired;

      const nextMessageIndex = messageIndex + 1;
      setMessageIndex(nextMessageIndex);
      //   window.removeEventListener("keydown", handleKeyDown);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });
  return (
    <div className="w-screen h-screen p-10">
      <div className="w-full h-full rounded-xl outline outline-1 outline-neutral-400 shadow-[0px_0px_15px_0px] shadow-black/80">
        {/* Header */}
        <div className="w-full h-[3.5%] bg-zinc-700 rounded-t-xl flex flex-row">
          <div className="flex flex-row items-center ml-2 gap-2">
            <span className="h-3 w-3 bg-[#ff5e57] rounded-full" />
            <span className="h-3 w-3 bg-[#febc2c] rounded-full" />
            <span className="h-3 w-3 bg-[#26c93e] rounded-full" />
          </div>
          <div className="w-full h-full flex justify-center items-center text-neutral-200 text-sm font-semibold">
            📁 ~{path}
          </div>
        </div>
        {/* Body */}
        <div className="w-full h-[96.5%] bg-zinc-900 rounded-b-xl text-white font-mono p-1 gap-3">
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
                className="h-6 w-full bg-transparent border-none outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
              />
            </form>
          )}
          {terminalMessage}
        </div>
      </div>
    </div>
  );
}

export default Terminal;
