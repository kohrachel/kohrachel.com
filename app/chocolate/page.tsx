"use client";
export default function Chocolate({}: {}) {
  const array = (n: number) => Array.from({ length: n }, (_, index) => index);
  return (
    <div className="h-screen w-screen bg-red-500 flex flex-col items-center justify-center">
      <img
        src="/assets/chocolate-wrapper.png"
        alt="chocolate"
        className="absolute h-80 object-cover"
      />
      <div className="absolute h-72 w-72 p-1 rounded-sm object-cover grid grid-rows-4 grid-cols-4 bg-[#4f2c1c]">
        {array(16).map((index) => (
          <img
            key={index}
            onClick={() => console.log(index)}
            src="/assets/chocolate-square.png"
            alt="chocolate"
            className="object-cover"
          />
        ))}
      </div>
    </div>
  );
}
