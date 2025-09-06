export default function Diamond() {
  return (
    <div className="bg-black w-full h-screen text-white flex flex-col justify-center text-center items-center xl:p-32 p-4">
      <p>hello i'm diamond</p>
      <img
        src="/assets/diamond-stars.png"
        alt="Diamond stars"
        className="h-1/2"
      />
      <p>hello i'm diamond</p>
    </div>
  );
}

type allowedExtensions = "png";
type imgSrcType = `/assets/${string}.${allowedExtensions}`;

type SectionProps = {
  title: string;
  imgSrc: imgSrcType;
  children: string;
};

function Section({ title, imgSrc, children }: SectionProps) {
  return (
    <>
      <h1>{title}</h1>
      <img src={imgSrc} alt="Diamond stars" className="h-1/2" />
      <p>{children}</p>
      <button
        aria-label="go to next section"
        className="outline-dotted outline-purple-100 py-3 px-4 rounded-2xl"
      >
        Next →
      </button>
    </>
  );
}
