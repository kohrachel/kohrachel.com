type allowedExtensions = "png";
type imgSrcType = `/assets/${string}.${allowedExtensions}`;
export type SectionProps = {
  title: string;
  imgSrc: imgSrcType;
  bodyText: string;
};

export function Section({ title, imgSrc, bodyText }: SectionProps) {
  return (
    <div className="flex flex-col text-center items-center h-[85%]">
      <h1 className="text-3xl font-serif italic font-semibold p-5">{title}</h1>
      <img
        src={imgSrc}
        alt="Diamond stars"
        className="w-5/6 sm:w-1/2 lg:w-1/3"
      />
      <div className="overflow-auto flex flex-col gap-3 text-start">
        {bodyText.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
