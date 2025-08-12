"use client";

import { useCallback, useState } from "react";
import {
  BaseEditor,
  createEditor,
  Descendant,
  Editor,
  Element,
  Transforms,
} from "slate";
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
    children: [{ text: "Awaiting your rambles" }],
  },
];

export default function MyEditor() {
  const [editor] = useState(() => withReact(createEditor()));

  const renderElement = useCallback(
    (props: {
      element: CustomElement;
      attributes: React.HTMLAttributes<HTMLDivElement>;
      children: React.ReactNode;
    }) => {
      switch (props.element.type) {
        case "code":
          return <CodeElement {...props} />;
        default:
          return <DefaultElement {...props} />;
      }
    },
    []
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "`" && event.ctrlKey) {
      event.preventDefault();
      const [match] = Editor.nodes(editor, {
        match: (n) => n.type === "code",
      });
      Transforms.setNodes(
        editor,
        { type: match ? "paragraph" : "code" },
        { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
      );
    }
  };

  return (
    <ArcOutline>
      <Slate editor={editor} initialValue={initialValue}>
        <Editable
          renderElement={renderElement}
          onKeyDown={handleKeyDown}
          className="p-7 rounded-lg h-full focus:outline-none flex flex-col gap-3"
        />
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

// TODO: add highlight.js support for code higlighting in here
const CodeElement = ({ children }: { children: React.ReactNode }) => {
  return (
    <pre className="w-full bg-neutral-100 rounded-md outline outline-neutral-200 p-3">
      <code className="">{children}</code>
    </pre>
  );
};

const DefaultElement = ({ children }: { children: React.ReactNode }) => {
  return <p>{children}</p>;
};

// const initialValue = [
//     {
//       type: 'paragraph',
//       children: [{ text: 'A line of text in a paragraph.' }],
//     },
//   ]

//   const App = () => {
//     const [editor] = useState(() => withReact(createEditor()))

//     const renderElement = useCallback(props => {
//       switch (props.element.type) {
//         case 'code':
//           return <CodeElement {...props} />
//         default:
//           return <DefaultElement {...props} />
//       }
//     }, [])

//     return (
//       <Slate editor={editor} initialValue={initialValue}>
//         <Editable
//           renderElement={renderElement}
//           onKeyDown={event => {
//             if (event.key === '`' && event.ctrlKey) {
//               event.preventDefault()
//               // Determine whether any of the currently selected blocks are code blocks.
//               const [match] = Editor.nodes(editor, {
//                 match: n => n.type === 'code',
//               })
//               // Toggle the block type depending on whether there's already a match.
//               Transforms.setNodes(
//                 editor,
//                 { type: match ? 'paragraph' : 'code' },
//                 { match: n => Element.isElement(n) && Editor.isBlock(editor, n) }
//               )
//             }
//           }}
//         />
//       </Slate>
//     )
//   }
