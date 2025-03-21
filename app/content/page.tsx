"use client";

import { useState, useEffect } from "react";
import { Island_Moments } from "next/font/google";

const islandMoments = Island_Moments({
  weight: "400",
  variable: "--font-island-moments",
  subsets: ["latin"],
});

const entries = [
  {
    date: new Date(),
    title: "Hello World",
    categories: ["coding", "life", "stories"],
  },
  {
    date: new Date(),
    title: "Goodbye World",
    categories: ["smile", "what the heck", "why"],
  },
];

const Content = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    // Check initial width
    checkWidth();

    // Add event listener for window resize
    window.addEventListener("resize", checkWidth);

    // Cleanup
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return (
    <div className="p-8">
      <div className="flex gap-3">
        <p className="text-xl font-bold mb-6">with love,</p>
        <p className={`${islandMoments.className} text-4xl text-orange-300`}>
          r. k.
        </p>
      </div>
      <div className="px-10">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="border-b border-orange-200">
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Title</th>
              {!isMobile && <th className="text-left p-4">Categories</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map(({ date, title, categories }) => (
              <Entry
                key={title}
                date={date}
                title={title}
                categories={categories}
                displayCategories={!isMobile}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface EntryProps {
  date: Date;
  title: string;
  categories: string[];
  displayCategories: boolean;
}

const Entry = ({ date, title, categories, displayCategories }: EntryProps) => {
  return (
    <tr className="border-b border-dashed border-stone-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="p-4">
        {date.toLocaleDateString("en-US", { month: "short" }) +
          ". " +
          date.toLocaleDateString("en-US", { day: "numeric" })}
      </td>
      <td className="p-4">{title}</td>
      {displayCategories && (
        <td className="p-4 flex flex-row gap-2">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-stone-700 rounded-xl text-xs py-1 px-2 align-middle max-h-max"
            >
              {category}
            </div>
          ))}
        </td>
      )}
    </tr>
  );
};

export default Content;
