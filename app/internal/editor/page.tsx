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

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "`" && event.ctrlKey) {
      // Prevent the "`" from being inserted by default.
      event.preventDefault();
      // Otherwise, set the currently selected blocks type to "code".
      Transforms.setNodes(
        editor,
        { type: "code" },
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
          className="p-3 rounded-lg h-full focus:outline-none"
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

const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>;
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
