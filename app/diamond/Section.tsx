import { Dispatch, SetStateAction } from "react";
type allowedExtensions = "png";
type imgSrcType = `/assets/${string}.${allowedExtensions}`;
export type SectionContents = {
  title: string;
  imgSrc: imgSrcType;
  children: string;
};

export type SectionProps = SectionContents & {
  section: number;
  setSection: Dispatch<SetStateAction<number>>;
};

export function Section({
  title,
  imgSrc,
  children,
  section,
  setSection,
}: SectionProps) {
  // const { section, setSection } = useContext(SectionContext);
  return (
    <div className="flex flex-col text-center items-center h-full xl:px-32 p-9 pb-4">
      <h1 className="text-3xl font-serif italic font-semibold p-5">{title}</h1>
      <img
        src={imgSrc}
        alt="Diamond stars"
        className="w-5/6 sm:w-1/2 lg:w-1/3"
      />
      <div className="overflow-auto flex flex-col gap-3 text-start">
        {children.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <div className="flex gap-3 bottom-0 mt-auto w-[100vw] justify-center backdrop-blur-md">
        {section !== 0 && (
          <button
            aria-label="go to next section"
            className="outline-dotted outline-purple-100 py-3 px-4 rounded-2xl my-3"
            onClick={() => setSection((prev) => prev - 1)}
          >
            ← Back
          </button>
        )}
        {section !== 4 && (
          <button
            aria-label="go to next section"
            className="outline-dotted outline-purple-100 py-3 px-4 rounded-2xl my-3"
            onClick={() => setSection((prev) => prev + 1)}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
