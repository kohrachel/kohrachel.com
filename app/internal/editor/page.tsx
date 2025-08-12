"use client";

import { useState } from "react";
import { BaseEditor, createEditor, Descendant } from "slate";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";

type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = { text: string };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

export default function Editor() {
  const [editor] = useState(() => withReact(createEditor()));
  // Render the Slate context.
  return (
    <ArcOutline>
      <Slate editor={editor} initialValue={initialValue}>
        <Editable className="p-3 rounded-lg h-full focus:outline-none" />
      </Slate>
    </ArcOutline>
  );
}
// TODO: potentially extract this out for other components too (but might have to consider potential style overwrites)
const ArcOutline = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen p-6 bg-neutral-100">
      <div className="h-full p-2 rounded-xl border bg-purple-100 outline outline-purple-200 shadow-xl shadow-black/30">
        <div className="h-full p-1 rounded-lg gap-11 outline outline-purple-200 bg-white overflow-y-scroll">
          {children}
        </div>
      </div>
    </div>
  );
};
