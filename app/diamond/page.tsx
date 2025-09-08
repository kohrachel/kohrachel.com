"use client";
import { useState } from "react";
import BirthdayCard from "./BirthdayCard";
import { NavButtons } from "./NavButtons";
import { Section, SectionProps } from "./Section";

export default function Diamond() {
  const [section, setSection] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const { title, imgSrc, bodyText } = contents[section];

  function returnToStart() {
    setShowCard(false);
    setSection(0);
  }

  if (showCard) return <BirthdayCard returnToStart={returnToStart} />;

  return (
    <div className="bg-black w-full h-screen text-white flex flex-col justify-between xl:px-32 p-9 pb-4">
      <Section title={title} imgSrc={imgSrc} bodyText={bodyText} />
      <NavButtons
        section={section}
        setSection={setSection}
        setShowCard={setShowCard}
      />
    </div>
  );
}

const contents: SectionProps[] = [
  {
    title: "This is a rock",
    imgSrc: "/assets/rock.png",
    bodyText: `At first glance, it looks ordinary. You probably wouldn't have noticed if you passed it on the street.
    But this rock is anything but ordinary, and you'll soon see why.`,
  },
  {
    title: "The rock is stressed",
    imgSrc: "/assets/rock-under-pressure.png",
    bodyText: `Life isn't always kind to the ordinary.
    Sometimes the rock gets put under a lot of pressure. Most rocks would cry out the unfairness of the situation. After all, why did they have to deal with this much pressure? They worked harder than other rocks they knew, they were responsible, caring, and all the other things that good rocks were.
    But this rock knew there was no point decrying the unfairness of life. Life was never fair. Instead, the rock took it in stride, and found ways to keep going. It was really hard, but the rock never relented.`,
  },
  {
    title: "It's too much",
    imgSrc: "/assets/rock-broken.png",
    bodyText: `But there's only so much pressure a rock can withstand. The rock withstood and withstood, but the pressure never abated. Life can be harsh in the things that it demands of us, and it hasn't been the kindest to this rock.
    Yet life isn't a tyrant. We find silver linings even in the cloudiest of situations, and the rock probably never could have imagined what's coming next.`,
  },
  {
    title: "It's a diamond!",
    imgSrc: "/assets/diamond-stars.png",
    bodyText: `Emerging from the fissures of the rock was a shiny diamond!
    That's the funny thing about pressure. It can crush you to pieces or mould you into a diamond. It's much easier to get crushed than to become a diamond. Diamonds withstand way more pressure and heat, and for much longer.`,
  },
  {
    title: "Diamonds are pretty (cool)",
    imgSrc: "/assets/diamond.png",
    bodyText: `This rock may have looked ordinary, but it never was. Only a truly special rock could have the strength to preservere through the pressure and emerge out the other end as a diamond.
    I've only personally met a few of these rocks in life. And you may think that well, it doesn't matter what the rock was, because most of it was lost when we choose to focus on the small part that eventually became the diamond. To that, I would say you're right. But the rock became the diamond, and it will always live on in the diamond. The diamond will remember the rock, even if the rest of the world have eyes only for the pretty, shiny parts of it.`,
  },
];
