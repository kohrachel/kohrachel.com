"use client";
import { useState } from "react";
import { Section, SectionContents } from "./Section";

// const SectionContext = createContext({});
export default function Diamond() {
  const [section, setSection] = useState(0);
  const { title, imgSrc, children } = contents[section];
  return (
    // <SectionContext value={{ section, setSection }}>
    <div className="bg-black w-full h-screen text-white flex flex-col justify-center text-center items-center xl:p-32 p-4">
      <Section
        title={title}
        imgSrc={imgSrc}
        section={section}
        setSection={setSection}
      >
        {children}
      </Section>
    </div>
    // </SectionContext>
  );
}

const contents: SectionContents[] = [
  {
    title: "This is a rock",
    imgSrc: "/assets/rock.png",
    children: "At first glance, it looks ordinary.",
  },
  {
    title: "2",
    imgSrc: "/assets/rock-under-pressure.png",
    children: "pressure cooker",
  },
  {
    title: "3",
    imgSrc: "/assets/rock-broken.png",
    children: "pressure cooker",
  },
];
