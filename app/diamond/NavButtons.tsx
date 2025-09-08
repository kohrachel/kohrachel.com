import { Dispatch, SetStateAction } from "react";
export type NavButtonProps = {
  section: number;
  setSection: Dispatch<SetStateAction<number>>;
  setShowCard: Dispatch<SetStateAction<boolean>>;
};

export function NavButtons({
  section,
  setSection,
  setShowCard,
}: NavButtonProps) {
  return (
    <div className="flex bottom-0 w-full">
      {section !== 0 && (
        <button
          aria-label="go to previous section"
          className="outline-dotted outline-purple-100 py-3 px-4 rounded-2xl my-3"
          onClick={() => setSection((prev) => prev - 1)}
        >
          ← Back
        </button>
      )}
      <button
        aria-label="go to next section"
        className="outline-dotted outline-purple-100 py-3 px-4 rounded-2xl my-3 ml-auto"
        onClick={() => {
          if (section === 4) {
            setShowCard(true);
            return;
          }
          setSection((prev) => prev + 1);
        }}
      >
        Next →
      </button>
    </div>
  );
}
