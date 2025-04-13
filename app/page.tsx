"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-max w-full flex flex-col bg-blue-500">
      {/* First panel */}
      <div className="h-screen bg-pink-300">
        <img src="/assets/hello.jpg" alt="hello" className="rounded-3xl h-96" />
      </div>

      {/* Second panel */}
      <div className="h-screen bg-stone-600">
        <p>hi</p>
      </div>
    </div>
  );
}
