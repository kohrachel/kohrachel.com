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
          Love, Rachel
        </p>
        <button
          aria-label="go to previous section"
          className="outline-dotted outline-purple-100 py-3 px-4 rounded-2xl my-3"
          onClick={returnToStart}
        >
          ← Return to start
        </button>
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
So the theme of this card is diamonds. See, I know what you want. I did some Googling to find out how diamonds are created, and I realized that wow, diamonds are (almost) the same thing as graphite. I was very tempted to get you some pencil leads with a note saying sorry for messing up the chemistry carbon structure thingy. See I’m so nice I didn’t even do that. (hm… now that I think about that…)
In all seriousness, I’ve never met someone as strong and as intelligent as you. I’ve definitely never met someone who knows so much about the world, from science to history to psychology. I still think you downloaded an encyclopedia into your head at some point. Maybe knowledge comes with experience, but I still think it’s really cool how you’ve processed the raw things that life throws at you and turned them into wisdom. I think that in itself is pretty hard. It’s so much easier to just get lost in complaining about the injustices of life. I mean, look at Sky. 
You taught me a bunch of really cool stuff. I remember us talking before I went to uni about how you’ve tried your best to give me a toolbox for life and you’re now handing it to me to go do with it what I want, and for some reason that still makes me want to cry when I think about it. In a good way. It’s still one of my favorite memories to this day. I mean, it was a little bit scary and frustrating in the beginning when I realized I was actually on my own, but I’ve also realized that it’s pretty nice. It was kind of weird when I realized for the first time that I was actually looking forward to adulting instead of finding it sort of exciting and daunting in one. Thanks for giving me the freedom to live life and the common sense to live it properly. 
You taught me how to be strong and determined. Okay, maybe I’m also just a stubborn kid, but that’s besides the point. I remember getting frustrated when I was younger because it always felt like Mummy knew everything best. I was impatient and I wanted to do things myself but I wanted to do it perfectly and better than Mummy, and somehow that never worked out as planned. I guess I’m learning a little bit of your expertise from all the times I’ve failed and flailed around, but it’s still very unfair that my Mummy is very very good at basically everything. Not that you should tell her that, or else she’s going to hold it over your head for 14 years like the one time you didn’t know what orange was called in malay. 
You said that you were never the brightest student among your friends, but you set me up to succeed among mine. You may have forgotten to drill into me how to actually make those friends, but it’s okay, I have Sky and Sandy. You love all the stuffed toy animals even if you’ll never admit it. For your next birthday I’m going to get you a box full of stuffed toy animals and watch you pretend not to like them. 
I think you’re really impressive, and I don’t think I’ll ever be able to realize just how lucky I was to grow up associating you with the bar for competency in humans. Maybe that bar was a little bit too high and most people need to learn how to high jump (preferably without spraining their ankle in the process), but hey, I think it’s been a great thing overall. You’re a good role model. And I’m glad you’re my Mummy. 
Stay healthy (stop disintegrating) and please go renew your honeymoon or something away from Chloe and me. You and Daddy are incredibly insufferable. Happy birthday. Don’t miss me too much.`;
