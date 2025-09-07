type allowedExtensions = "png";
type imgSrcType = `/assets/${string}.${allowedExtensions}`;
export type SectionContents = {
  title: string;
  imgSrc: imgSrcType;
  children: string;
};

// export type SectionProps = SectionContents & {
//   section: number;
//   setSection: Dispatch<SetStateAction<number>>;
// };

export function Section({ title, imgSrc, children }: SectionContents) {
  return (
    <div className="flex flex-col text-center items-center h-[90%]">
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
    </div>
  );
}
