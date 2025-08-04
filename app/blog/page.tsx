"use client";
import Link from "next/link";
import SinglePost from "@/components/SinglePost";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Blog() {
  const params = useSearchParams();
  const [activePost, setActivePost] = useState<postType>(() => {
    const sentData = params.get("index");

    return sentData ? posts[Number(sentData)] : posts[0];
  });

  return (
    <div className="h-screen w-screen flex">
      <div className="m-4 w-full h-stretch flex rounded-xl bg-purple-100 outline outline-purple-200 shadow-xl shadow-black/30">
        <div className="w-1/5 h-full flex justify-between px-8 py-16">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <p className="text-stone-900 text-4xl font-serif font-bold italic">
                rachel&apos;s ramblings
              </p>
              <p className="text-stone-900 text-sm">
                screaming into the void (and to you, I guess)
              </p>
            </div>
            <hr className="bg-purple-300 h-0.5 w-2/3"></hr>

            <div>
              <p className="font-serif font-semibold text-lg italic">
                editor&apos;s picks
              </p>
              <ul className="text-sm list-outside list-disc pl-5 flex flex-col">
                {posts.map(
                  (post, index) =>
                    index < 4 && (
                      <button key={index} onClick={() => setActivePost(post)}>
                        <li className="underline underline-offset-1 hover:underline-offset-2 hover:decoration-purple-500 decoration-purple-100 transition-all duration-700 w-max text-stone-900">
                          {post.title}
                        </li>
                      </button>
                    )
                )}
              </ul>
            </div>
            <Link href="/" className="absolute bottom-11">
              <button className="px-4 py-2 bg-purple-100 hover:bg-purple-200 outline outline-purple-100 hover:outline-dashed hover:outline-purple-700 text-purple-800 font-medium rounded-lg transition-all duration-300">
                ← go home
              </button>
            </Link>
            <div className="flex gap-2 justify-between"></div>
          </div>
        </div>

        <div className="w-3/5 h-full py-2">
          <div className="flex justify-between w-stretch h-full rounded-lg outline outline-purple-200 bg-white overflow-y-scroll">
            <div className="h-full w-full">
              <SinglePost post={activePost} />
            </div>
          </div>
        </div>

        <div className="overflow-scroll p-4 h-full w-1/5 flex flex-col">
          <div className="grid grid-cols-1 gap-y-3 h-full w-full overflow-scroll p-1 ">
            {posts.map((post) => (
              <button
                key={post.title}
                className="rounded-xl"
                onClick={() => setActivePost(post)}
              >
                <div className="group rounded-xl p-4 h-max outline-2 outline-dashed outline-purple-100 hover:outline-purple-700 hover:bg-purple-200 transition-all duration-700">
                  <div className="flex flex-col gap-1">
                    <p className="text-stone-900 text-3xl group-hover:text-stone-500 font-serif font-bold italic transition-all duration-300">
                      {post.title}
                    </p>
                    <p className="text-stone-900 text-xs group-hover:text-md transition-all duration-300">
                      {post.description}
                    </p>
                    <p className="text-xs uppercase text-stone-500">
                      {post.date}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export type postType = {
  title: string;
  href: string;
  description: string;
  date: string;
  content: string;
  imgPath?: string;
};

export const posts: postType[] = [
  {
    title: "you don't exist",
    href: "/you-dont-exist",
    description: "the book that just saved me that you haven't heard of",
    date: "2025-04-15",
    content: `A lot of things are going on at the moment. Well, a lot of things are going on at any given moment, if you ask me. I'm not aware of a moment where there aren't a lot of things going on.
              And maybe that's part of the problem. I'm reading a book currently that talks about how Buddhism (and meditation) can help us better understand the world, and it's pretty insightful. Buddhism is one of those things that the more I learn about, the less I know. For something so allegedly fundamental to my life, I don't understand it nearly enough. But this book is awesome. It was written by Robert Wright (future Rachel fact check this please), and he starts off the book by talking about how to follow the Buddhist path is to take the red pill. 
              One of my favorite traits about writing is when authors describe something so obvious that every step feels like an axiom being presented, yet when you put it all together it reveals something so great that you're just left staring in its wake in awe. This book is like that for me.
              So much goes on in every day, in every moment of every day. I used to stop to smell the flowers while walking to class in freshman year, and I thought that was me being... thoughtful, you know? Appreciating nature's beauty in the delicateness of each petal, in the smooth waves in which they sway in the breeze.
              But reading this, I've realized it isn't about that, not really. It's more meta than that. It's the thoughts in your head, that aren't even your thoughts, and the things you feel, that aren't even your feelings. You're not who you think you are, and you are not in control of yourself. The book puts these concepts a lot less existential crisis-y than I am, but you chose to read this dumpster fire, so clearly you don't value your sanity that much.  
              Anyway. Some years back I watched this Ali Abdaal video in which he shared his productivity tips for sleep efficiency (yes, really). We will skip over the fact that I used to be more productivity bro than I would like to admit. One of the tips he shared was what I've recently learned is called a body scan, where you lie flat on your back and imagine relaxing each part of your body from your toe to your head, essentially "scanning" over your entire body and making yourself relax. I still do this on occasions when I find myself as a shepherd with an amazingly large herd of sheep, and I acquiesce that it does help. 
              But it's interesting. As I relax my body, my mind tends to come more sharply into focus, as in it tends to wander. Even as I'm in a half-comatose state of drowsiness, I find that my mind can be stubbornly awake, thinking of things that make it hard to enter a mental state of relaxation. 
              This failing to enter a meditative (or in my case meditative-like) state is exactly what the book uses to argue that your thoughts, emotions, and feelings are not coming from you but rather a product of several distinct modules in the brain. Each module constructs a thought, and some modules may be associated with a certain flavor of thought. Thoughts (or modules, I guess?) then compete amongst themselves for your attention. If they capture it, they then enter into your consciousness. 
              I've never thought of well, thoughts, this way before. It will make more sense if you read the book than if you read this word dump, so do that before you judge the idea. There's a reason why Robert Wright is a critically acclaimed author and I'm not. 
              But I think that it's a useful view of the world to apply the principle that the book advocates, which is to look at thoughts and feelings as something separate from the emotion that underlies them. I tend to feel my feelings deeply, whatever their nature, and that has helped but also hurt my ability to be a good human being in various contexts. I think trying to practice this distance in real life scenarios would be immensely useful, and I'm going to try. 
              I'm still only halfway through the book, so perhaps I'll update back with more life-changing revelations once I'm through, but we know how good I am at updating this blog, so take what you get and be grateful for it.`,
    imgPath: "/assets/blog/example43.jpg",
  },
  {
    title: "blog about a blog",
    href: "/blog-about-a-blog",
    description: "i sense a glitch in the matrix",
    date: "2025-02-18",
    content: `i'm making a blog. i mean, another blog. that will hopefully actually have content i want the world to see rather than just rambles. not that i think rambles aren’t meant to be seen, but you know.
              i wanna write about how to document things. i think i often try to solve some challenge by trying a million different things to get there, and when i finally solve it, i have no idea what the heck i did. it’s sad. i spent hours on this and i have no idea what i did? cmon.
              i wanna start documenting all the trial and errors, the red herrings and rabbit holes, false positives and ill-informed narratives. without all the exes, fights, and falls, we wouldn’t be standing here so tall. and stuff like that. 
              i wanna keep more records of me. how i stumble and fall and fumble and stall. and maybe emerge victorious at the end. cause like. why not?`,
    imgPath: "/assets/blog/example43.jpg",
  },
  {
    title: "5 scrapped NYT bestsellers",
    href: "/5-scrapped-nyt-bestsellers",
    description: "sometimes you should get an editor",
    date: "2024-11-26",
    content: `Hello and welcome to my soapbox. Here's some little snippets of what my brain has been up to lately.
              Checks & Balances
              Mummy drilled it into me long ago that academic success does not often translate to professional (read: monetary) success. That stability and wealth are to some extent inversely proportional of one another to the proletariat, and the structure of standardized education was of the goal of creating good office workers, not tycoons. 
              We watched 3 Idiots sometime in the recent past. Perhaps mummy was trying to prevent me from turning into the Silencer's version of success. I don't think she was trying to convince me of the merits of Rancho's success (or excellence, as he calls it), but I think she was pushing the narrative that book smarts don't equate professional success, and I think she's right. 
              Why bring this up now? I've spent some time this semester debating the priority of my coursework against my internship search, and I've found myself choosing the prior despite a niggling voice in the back of my head screaming at me that I'm making the wrong choice. I know the voice is right, and yet, as November nears its end, I've scarcely applied to 50 internships for the coming summer. I've been guilt-tripping myself over this for months. So why haven't I done anything about it? 
              The most concise answer I can give is that this is simply everything I've ever known. That to keep my nose to the grindstone is the doctrine that I've learned to subscribe to, that has served me so well that to abandon it for something much more foreign seems like an abandonment of what it means to be an upstanding student. And wasn't that my identity for the longest time? 
              Jay Chou got it right all those years ago. I should listen. 
              Rings of Social Salt
              Draw a salt circle, say a chant, join the ritual. Hurry, we must finish before they change their minds and leave us. Again.
              Humans are the most beautiful, bubbly, joyful, calming, warm, terrible thing ever. I talk about finding "my people" like some born-again talks about their Savior. I used to try to hold on to the people in my life with a vice-like grip until my knuckles turned ghostly white from the effort. I used to think that if I clung on tightly enough, I could keep people in my pristinely-drawn salt circles. All I achieved was hurting us both. 
              I used to find myself unlovable. Who in their right minds would want to stay with me?
              Don't ask me what changed. Perhaps it was the solitude of the lockdowns. Perhaps some little part of my brain decided to mature itself into having the capacity for rational thought. Or perhaps it was the paradigm shift that was Taylor's. I don't know, it doesn't matter. The important thing is that I've realized that being human and the interactions we have are far too complex to be defined within my tidy protective rings of salt. My attempts to claw people into these boundaries was as fruitless as efforts to keep the wind from a kolam. No matter how many times I recreated these lines, the inevitable movement of friendships and people within my life would scatter them beyond recognition far too quickly. 
              In mortality, there is no such thing as total immutability. 
              None of this is to say that impermanence equates lackluster. There is no such thing as forever, yes – our parents will, if they are lucky, pass away before us. So may our siblings, cousins, friends, and partners. If we are granted the gift of a long life, we shall also be subject to the curse of outliving many of those most dear to us. But death is an extreme case. We'll have many a Rancho in our lives who will enter and depart our lives without so much as a warning. And yet, many of these temporary people will leave indelible prints on our lives that we will carry with us for years to come. Perhaps you no longer talk to the second cousin you used to have playdates with every week, but you'll never forget the joy of splashing water in a kiddy pool. And that's real.
              The hopeless romantic inside me refuses to let me end this musing without pointing out that impermanence also does not necessarily imply transience. Amidst the constant ebb and flow, perhaps we'll be lucky enough to find a few rare individuals whose paths are similar enough that you'll get to traverse this puzzle of life together for a long while. Perhaps you'll find familiar shoulders to cry on, or faces that you'll share a toast with on your porch in your old age, or even the comforting arms you'll wake up in for many sleepy mornings to come. No, we won't be here forever, but perhaps some of us stick around longer than others. 
              I drew salt rings as a way of protecting myself from the fear that I was somehow lacking, and that I could patch the gaping hole in my self-confidence by stuffing it by freely giving out the label of friendship like Oprah gave out cars. I've met many incredible people in these brief decades I've been alive, and many of them have scattered like my once-precious salt rings. Once upon a time, I would have felt each of their absence like gaping holes in my self-worth. But I think I've finally understood that there isn't any protection to be found in hiding behind arbitrarily drawn lines of salt or friendship. 
              My salt rings don't exist any more, and I don't think my social life has ever made this much sense. 
              Blow me a bubble (and pop it)
              A soap bubble shimmers and warps the light into the most fragile of rainbows. Illusory mirages of beauty and the giggles of children. Floating through the wind like the carefree nature of their creation, until the inescapable force of gravity crushes it beneath its sole. 
              Sorry. 
              Anyway. We live in a bubble. Not just the ones of us who live in a quaint little college town in New England, I mean all of us. There's never going to be someone who has truly seen it all, and even if there was, there will never be someone who understands it all. Unless you're the Doctor, perhaps, but then why are you here? So we live in our safe little bubbles that is our friends, family, jobs, school, traffic, town, social media fads, and cuisine. We look at the world through the lens of our past experiences and think, wow, I should definitely form this opinion on this thing. Even a no-opinion is an opinion, so don't argue with me. 
              The things outside are warped by the iridescent boundaries of our bubbles and the ones around everyone and everything else. There's that separation of us versus them. And yes, right after all that collapsing of the salt rings that we just went through, we're going to pretend that the boundary of the bubble is fluid. Get it? Because it's soap? Okay I'll stop I'm sorry. 
              But the title of this section in itself is a little misleading, as I'm sure the sharper amongst you would have caught onto. You can't pop the bubble. That's literally what I started this whole point with (ignore the first paragraph, that was for the benefit of my inner theatre kid). So we can't pop the bubble. Does that mean we get to live in our little bubbles happily ever after, and I should drop the cynicism for the picket fence dream house? 
              That was a rhetorical question. No, we can't escape our bubbles. They will pop, it just takes a lifetime for them to get there. It's a very inefficient process, institutionalized society ruins everything. You can grow it to include more things, but then all you achieved was literally just to stretch yourself thinner. You can try to educate yourself, but exercise caution to keep your savior complex in check. You are no knight in shining armor – and if you are descended from those who were, well, inform yourself of the bloodshed that flows in your veins. There are over 8 billion people on this planet. Please live and let live, above all. 
              So then is the best path simply to seek comfort in our ignorance? Perhaps. I think it's important to look outside and acknowledge that the thing we are looking at is in fact, outside. It's not necessarily a bad thing or something that needs remedying, but I do think it needs acknowledging. Honestly, I think, in this stupidly crazy modern mania that we live in, that would be enough for most. 
              Cause for alarm
              Did you know that women sleep, on average, 11 minutes more than men? 
              There is no quicker way to get me to hate a sound bite than to make it the tune that wakes me in the morning. Something about the call that rouses me from the warm comforts of my bed into the cold harshness of reality is just really aggravating on the nerves, you know? Can't quite understand why, it's a rather peculiar mystery. 
              Those close to me may point out that there is perhaps some weight to the fact that I have been consistently lacking the sufficient number of hours required for a deep sleep as a motivating factor for my deep distaste of morning alarms. My response to that shall simply be to urge them to read the title of this section. Why do you think we're gathered here today? 
              I need to fix my sleep deprivation problem, I'm aware. I've been a night owl practically all my life, but recently it's been teetering on the boundary point at which concern is justifiable, and I'm deeply aware of it. I don't quite know what the best course of action is. Telling myself to sleep earlier is a tried and useless method. I've learnt that in the context of psychology, the most convenient solution is often just a mockup of the thing that would actually work. 
              So no, I'm not subscribing myself to the 5am challenge. I slept at 5am today. There's no way I'm getting up then. I think, reflecting on my typical sleeping habits and, unfortunately, daytime responsibilities, I typically need to be up by 9am. Allocating for buffer time, that means the latest time I should be productive is 12am. Account for a reality check on top of that, so 11:30pm. Hm. Doable? 
              I'll report right back, in hopefully a less horrifying way than that angel-soldier reporting to the Doctor. 
              O' Dear Storyteller
              Conciseness? I don't know her.`,
    imgPath: "/assets/blog/example43.jpg",
  },
  {
    title: "ete",
    href: "/ete",
    description: "written purely out of self-indulgence",
    date: "2024-06-11",
    content: `Somewhere on the spectrum of time between yesterday and yesteryear, I attempted to type some word on my phone that ostensibly began with some variation of the typical-enough 'ete'. The definition and structure of the word I originally intended to construct have long been swallowed by my amnesia for the details in our life fortunate enough to be deemed mundane, which supports my hypothesis that this word itself was not meant to be anything in the realm of the extraordinary.
              The dearest little elf-clerk manning the busy desk of my keyboard (also known by his stage name autocorrect) saw this attempt of mine, and as he always does, offered me several suggestions for how I should proceed in my completion of the word in that moment. The elf is a most delightful assistant most days, though there are moments when I suspect that the little aeroplane he finds so inseparable secretly doubles as a liquor flask. This was one of those moments. You see, the word that he proffered was quite... intriguing. I did not believe that this word was quite as commonplace in my vocabulary as he seemed to suggest, nor did I see any connection towards the normalcy of the situation in which it was conjured. I was left quite perplexed as to the justification behind his judgement.
              The word in question was "eternal", or some variation of that. I can't quite recall the last time this word has surfaced in my daily conversations sans some layer of sarcasm or fantasy. Why, then, was my jovial little elf pushing it forward? Perhaps he had gotten rather belligerent in the thankless years at his job, which I can understand. An advertisement was in circulation fairly recently regarding a overworked and underpaid beeper elf at a grocery store – perhaps he was expressing solidarity with a stranger-comrade. 
              No, I have not talked to him about this. How could I? I have no way of communicating with him except through these suggestions that he proposes, each time my fingers hit the keyboard. He cannot respond to me, and I don't expect him to. Some barriers are not meant to be crossed, after all. Just consider the great one living in the – worryingly – warm depths of Oceania. 
              But I digress. Perhaps the suggestion was somehow reflective of my own habits, buried too deep in my subconscious for me to retrieve. Perhaps I am of the character of the tortured poet who would seek to utilize this word, and the truth simply never dawned on me. If that were true, then our chairman once decreed that it was not a bad preposition to embrace such characters in her entirety. To engage in her inane chatter and verbosity of literature, and to revel in the masquerade of her mayhem. In my many years in this department, I have seldom found the advice of our chairman to be lacking, and I this is no exception. 
              Thank you, dear reader, for participating in my character study.
              fin.`,
    imgPath: "/assets/blog/example43.jpg",
  },
  {
    title: "a series of goodbyes",
    href: "/",
    description: "this is not sappy at all",
    date: "2024-07-18",
    content: `I should sleep soon. I should be sleeping right now, actually. But all my best thoughts are written to the tune of a quiet midnight serenade, so I figured I’d linger for a bit.
              I didn’t really write my goodbyes properly. I was revisiting my mental health journey in my journal as an exercise in reflection for my birthday, but I think I left off around the 14-year-old mark. Oh, the number of things I haven’t covered. I’m aware I sound like an old grandmother sharing the adventures of her youth. But it truly feels like I’ve lived three whole lifetimes since 14.
              Here’s hoping the years to come are slightly more stable than that.
              The point is I’m covering the negatives, but I haven’t really covered the positives. And those deserve a goodbye too. I think I tend to think of it as the things that get carried forward. I’ll keep my childhood wonder, thank you very much. But there’s only so much of the past that you can keep with you before it starts to crowd your mind-space, and while I’ll forever be imprinted by every past version of me and her experiences, I’m no longer her. To grow and to live, I have to leave her behind.
              Somehow, at some point, I started to think of my adolescence as a time of hurt. I don’t recall the last time I sat down and reflected about all the things I loved about my childhood. And there’s many, many things that come up if I tune the radio of my mind to listen for it. Perhaps the connection is a little janky from being neglected for so many years, but there it is still — faithfully replaying dusty, shimmery memories.
              I’ll never be small enough to fit in a baby house again. I probably wouldn’t be comfortable in 18C weather in a tank top again either. I’ll never come home to my grandparents doing the laundry and hear my parents pull in the porch after work. I’ll never ride my father’s motorcycle around UP, letting the wind take with it all my worldly cares. My world will once again be that one house and its narrow kampung road. My sister isn’t in the next room any more. I’ve almost exhausted my share of nights in my childhood bed. I’ll never get to be nine-years-old folding an origami labrador in the upstairs room again. Never make another glowing LED tower with Gong Gong. Never do a full handwriting analysis with sammi to figure out which one of us wrote the words on this full scape paper. No more further lunches with keisha over a cup of milk tea at midnight.  
              same day, 10:53 PM
              There’s a million things, most of them forgotten and fading, that I’ve already done for the last time in my life. There’s people who I’ll never see again at recess, kids whose names and faces have eroded into unfamiliarity just as surely as our giggles have faded from my mind. There’s theme parks and restaurants that I can only visit in fragmented dreams, smudged handwriting I can never recreate, and girlish innocence that I will never restore. 
              I was happy, beautiful, loved, smart, and perhaps slightly kind. I was dreadful, insecure, hotheaded, mean, and too existential for my own good. I was a kid, and it was a good life. 
              If I pretend this is a never ending marathon where you can never stop moving (no matter how infinitesimally small your increments) then if I squint, I can see visions of past me squabbling with the rocky pathway. She’s an eager ball of energy, and she’s ever so quickly fading out of view like a ghostly sheen that’s slowly but surely being drained of its lifeforce.
              Have I mentioned my crippling inability to write fluff?
              But she does fade. All of her, and all versions of her. Yet she’s also being reborn with each step, lunge, and crawl forward. It’s an unbreakable cycle that I hope only ends when I do, and I’m glad it’s painful.
              Grief is what happens when love fails to find its recipient. I don’t grieve her. She is me, after all. I still feel her in the softness of my jaw and the rawness of my tears. I’m not losing her, I’m simply… letting go. 
              Metamorphosis, because apparently I’m a fucking butterfly.
              three days later, 1:33 AM
              So we close this chapter. Bade farewell to the fading and faded. Let go of the things that were once our whole world, because our world is bigger now. I’m sure we’ll encounter moments in the future that parallel them, and find ourselves struck with deja vu, or perhaps even nostalgia. All I hope for is that fondness never turns into longing, because the most tragic sort of unrequited love is the kind directed at the past. Trust me, I’m a physicist. 
              So thank you for the unbridled glee, the purity, and the innocence. We’ve had a good run. 
              Goodbye.`,
    imgPath: "/assets/blog/example43.jpg",
  },
  {
    title: "life (is a stained glass window)",
    href: "/",
    description: "and hopefully not in the wcs way",
    date: "2024-03-29",
    content: `hey
              it’s been a while
              how have you been? have you been taking care of yourself? drank enough water? gotten enough sleep?
              I’m such a hypocrite sometimes, but it’s okay. We’re all untangling this mess of life. We keep thinking of it as a journey. I think it’s more of panes in a stained glass window. The collage is what makes it beautiful, and we group sections of it into these neatly drawn boundaries separating out the colors that aren’t quite linear, but it was all built by an inexperienced hand, so all the panes in a cluster seem more similar, somehow.
              The colors, too. Every pane seems like it is made of a single color, but if you zoom in, you notice the topography of the pane is really more similar to sand dunes in an unexplored desert, created by wind and the rare instance of rain. Yet they all fit together. You can ignore some parts, the faces obviously get gazed on more than the unremarkable piece of background. But the window would be broken without even the smallest, most unremarkable piece, its gaping wound of light forcing you to acknowledge that there was once something there that isn’t any more.
              I wonder sometimes how I know what I know, and how I got where I got. Why am I who I am? Who made me? Why? Why does it matter?
              I think too much and nowhere near enough. I overthink and under think and think in all the wrong ways, but I think of beautiful things. Tragic, sometimes, but beautiful regardless.
              I think of the english teachers with their fancy terminology, plating a forced verbose vocabulary as some mockery of linguistic mastery. Oh, the irony. I know. I love it.
              It’s not gorgeous, not in the least. Nor is it ethereal, or whimsical, or dazzling. Radiance exists in the sunlight, perhaps, but we are not creatures of the sun, not perpetually. Magic lingers in the air, but it leaves far too much trace of glitter to be allowed into both the hallowed halls and musty corridors I traipse through like a princess under a fake identity of normalcy. Oh, sure, you could argue that it was breathtaking, but there are only so many breaths you can take before someone dies of oxygen deprivation. And I would rather not die just yet, thank you very much. Not even for the beauty of this little life. So perhaps I don’t love irony quite enough and way too much.
              Literature. I would hate to analyze my words. I wonder if any of this would make sense to me in retrospect, for the time when I inevitably decide to revisit the snapshots I captured of my immature ramblings to the void of the internet. I wonder if it even makes sense now.
              Perhaps it isn’t meant to. I should know.
              But I don’t.
              [The author declined to respond to our request for comment on her intentions behind this article.]
              sorry got sidetracked i otw eta 5 mins
              …
              sooooo you still here?
              …why? go away`,
    imgPath: "/assets/blog/example43.jpg",
  },
];
