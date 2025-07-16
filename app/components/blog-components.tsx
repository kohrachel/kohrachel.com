export function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-serif italic text-7xl font-bold my-2">{children}</h1>
  );
}

export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif italic font-bold text-5xl mt-9 mb-6">
      {children}
    </h2>
  );
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-base leading-relaxed mt-4">{children}</p>;
}
