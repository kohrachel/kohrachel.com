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
    <Slate editor={editor} initialValue={initialValue}>
      <Editable />
    </Slate>
  );
}
