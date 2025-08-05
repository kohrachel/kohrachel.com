function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-serif italic text-7xl font-bold pb-3 text-center">
      {children}
    </h1>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif italic font-bold text-5xl mt-6 mb-2">
      {children}
    </h2>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-base leading-relaxed">{children}</p>;
}

export { Title, Heading, Paragraph };
