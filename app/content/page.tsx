import { Island_Moments, Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const islandMoments = Island_Moments({
  weight: "400",
  variable: "--font-island-moments",
  subsets: ["latin"],
});

const entries = [
  {
    date: new Date(),
    title: "Hello World",
    categories: [
      "coding",
      "life",
      "stories",
      "I am a ridiculously long category for no reason",
      "what if there is more than one of me because rachel is weird?",
      "zi is the best",
    ],
  },
  {
    date: new Date(),
    title: "Goodbye World",
    categories: ["smile", "what the heck", "why"],
  },
];

const Content = () => {
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
              <th className="text-left p-4">Categories</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ date, title, categories }) => (
              <Entry date={date} title={title} categories={categories} />
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
}

const Entry = ({ date, title, categories }: EntryProps) => {
  return (
    <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="p-4">{date.toLocaleDateString("en-US")}</td>
      <td className="p-4">{title}</td>
      <td className="p-4 flex flex-row gap-2">
        {categories.map((category) => (
          <div className="bg-stone-700 rounded-xl text-xs py-1 px-2 align-middle max-h-max">
            {category}
          </div>
        ))}
      </td>
    </tr>
  );
};

export default Content;
