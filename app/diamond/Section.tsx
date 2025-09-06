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
    <>
      <h1>{title}</h1>
      <img src={imgSrc} alt="Diamond stars" className="h-1/2" />
      <p>{children}</p>
      <div className="flex gap-3">
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
    </>
  );
}
