"use client";
import { useState } from "react";
import { Section, SectionContents } from "./Section";

export default function Diamond() {
  const [section, setSection] = useState(0);
  const { title, imgSrc, children } = contents[section];
  return (
    <div className="bg-black w-full h-screen text-white flex flex-col text-center items-center xl:p-32 p-4">
      <Section
        title={title}
        imgSrc={imgSrc}
        section={section}
        setSection={setSection}
      >
        {children}
      </Section>
    </div>
  );
}

const contents: SectionContents[] = [
  {
    title: "This is a rock",
    imgSrc: "/assets/rock.png",
    children: "At first glance, it looks ordinary.",
  },
  {
    title: "The rock is very strong",
    imgSrc: "/assets/rock-under-pressure.png",
    children:
      "Life isn't always kind to the ordinary. Sometimes the rock gets put under a lot of pressure, so much that it can barely withstand it.",
  },
  {
    title: "Breaking points",
    imgSrc: "/assets/rock-broken.png",
    children:
      "What's happening? Well, the rock does its best to bend and deal with the pressure, but there's only so much you can give, and life never cared about fairness in the things that it asks of us. But wait, there's always a catch...",
  },
  {
    title: "It's a diamond!",
    imgSrc: "/assets/diamond-stars.png",
    children:
      "Pressure can mould and bend and break. This rock in particular withstood so much pressure that it turned into a diamond.",
  },
  {
    title: "Diamonds are special",
    imgSrc: "/assets/diamond.png",
    children:
      "Of course, this isn't always true. The same pressure could create coal, and it often does. But in certain special cases like this one, it doesn't. In those cases, the rock is so strong that the pressure that would have turned it into coal instead continued to build so much that the carbon bonded with each other to become diamond. What about the rest of the rock? Well, it's part of the diamond now. Some of it has to go, we can't cling onto everything of the past and also live. But the important parts remain in the gleams of the diamond",
  },
];
