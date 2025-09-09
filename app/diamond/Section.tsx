type allowedExtensions = "png";
type imgSrcType = `/assets/${string}.${allowedExtensions}`;
export type SectionProps = {
  title: string;
  imgSrc: imgSrcType;
  bodyText: string;
};

export function Section({ title, imgSrc, bodyText }: SectionProps) {
  return (
    <div className="flex flex-col text-center items-center h-[85%] gap-5">
      <div className="flex flex-col items-center">
        <img
          src="/assets/star-border-top.png"
          alt="three stars in 3d graphic art style forming a border"
          className="w-1/3"
        />
        <h1 className="text-4xl font-serif italic font-semibold py-3">
          {title}
        </h1>
        <img
          src="/assets/star-border-bottom.png"
          alt="three stars in 3d graphic art style forming a border"
          className="w-1/3"
        />
      </div>
      <img
        src={imgSrc}
        alt="Rock or diamond? Who knows..."
        className="w-2/3 sm:w-1/2 lg:w-1/3 outline outline-blue-300 outline-1 ring-2 rounded-3xl"
      />
      <div className="overflow-auto flex flex-col gap-3 text-start">
        {bodyText.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
