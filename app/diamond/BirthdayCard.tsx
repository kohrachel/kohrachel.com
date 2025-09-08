type BirthdayCardProps = {
  returnToStart: () => void;
};
export default function BirthdayCard({ returnToStart }: BirthdayCardProps) {
  return (
    <div className="w-full h-screen bg-black text-white">
      <div className="z-10 relative overflow-y-scroll h-full px-20 sm:px-28 md:px-44 lg:px-64 xl:px-80 pt-24 pb-28 sm:py-36 flex flex-col gap-3">
        <p className="font-serif font-semibold text-3xl italic">
          Happy Birthday Mummy!
        </p>
        {message.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        <p className="font-serif font-semibold italic text-xl text-end">
          -- Rachel
        </p>
      </div>
      <div
        className="absolute top-0 h-24 w-[95%] z-10"
        style={{
          background:
            "linear-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 1), rgba(0, 0, 0, 1), rgba(255, 255, 255, 0))",
        }}
      ></div>
      <div
        className="absolute bottom-0 h-28 w-[95%] z-10"
        style={{
          background:
            "linear-gradient(rgba(255, 255, 255, 0), rgba(0, 0, 0, 1), rgba(0, 0, 0, 1), rgba(0, 0, 0, 1))",
        }}
      ></div>
      <img
        src="/assets/diamond-star-border-top.png"
        alt="diamonds, stars, and pearls in a cartoon 3d style"
        className="absolute top-0 left-0 w-36 md:w-48 lg:w-72 xl:w-96 z-20"
      />
      <img
        src="/assets/diamond-star-border-bottom.png"
        alt="diamonds, stars, and pearls in a cartoon 3d style"
        className="absolute bottom-0 right-0 w-32 md:w-48 lg:w-72 xl:w-96 z-20"
      />
    </div>
  );
}

const message: string = `Yes, I may have called you a rock. But I called you a special rock okay, plus if you like diamonds so much you can’t possibly hate the thing that the diamonds live in… right? 
I did a little bit of research into diamonds and realized that wow, it’s (almost) the same thing as graphite. I was very tempted to get you some pencil leads with a note saying sorry for messing up the pressure setting. See I’m so nice I didn’t even do that. (I’ll save that for next year instead).
As you may be able to tell, I decided to make the theme of this “card” diamonds. I ended up researching how diamonds are created. I knew that diamonds were made under high pressure, but I didn’t know much other than that. 
Did you know that diamond is actually really abundant in the universe? Maybe we should go support Elon Musk’s obsession with space a little more. 
In all seriousness, I’ve never met someone as strong and intelligent as you. I’ve never met someone who knows so much about the world, from science to history to psychology. 
You said that you were never the brightest student among your friends, but you set me up to succeed among mine. You may have forgotten to drill into me how to actually make those friends, but it’s okay, I have Sky. And you love all the stuffed toy animals even if you’ll never admit it. And honestly, I still don’t understand how your friend group stays together after so long. I barely text my friends even with the 5 million different messaging apps I have accounts on. `;
