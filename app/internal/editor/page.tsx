"use client";

import { redirect } from "next/navigation";
import { useCallback, useState } from "react";
import {
  BaseEditor,
  createEditor,
  Descendant,
  Editor,
  Element,
  Transforms,
} from "slate";
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from "slate-react";
import { CustomElement, CustomText } from "types/internal-editor";

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
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }
  const [editor] = useState(() => withReact(createEditor()));

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "`" && event.ctrlKey) {
      event.preventDefault();
      CustomEditor.toggleCodeBlock(editor);
    } else if (event.metaKey) {
      if (event.key === "b") {
        event.preventDefault();
        CustomEditor.toggleBoldMark(editor);
      } else if (event.key === "i") {
        event.preventDefault();
        CustomEditor.toggleItalicMark(editor);
      }
    }
  };

  return (
    <ArcOutline>
      <Slate editor={editor} initialValue={initialValue}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
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
const CodeElement = ({ attributes, children }: RenderElementProps) => {
  return (
    <pre
      {...attributes}
      className="w-full bg-neutral-100 rounded-md outline outline-neutral-200 p-3"
    >
      <code className="">{children}</code>
    </pre>
  );
};

const DefaultElement = ({ attributes, children }: RenderElementProps) => {
  return <p {...attributes}>{children}</p>;
};

const Leaf = (props: RenderLeafProps) => {
  const { leaf } = props;
  let fontStyle = "";

  if (leaf.bold) {
    fontStyle += "font-bold ";
  }

  if (leaf.italic) {
    fontStyle += "italic ";
  }

  return (
    <span {...props.attributes} className={`${fontStyle}`}>
      {props.children}
    </span>
  );
};

const CustomEditor = {
  isBoldMarkActive(editor: Editor) {
    return this.isMarkActive(editor, "bold");
  },

  isItalicMarkActive(editor: Editor) {
    return this.isMarkActive(editor, "italic");
  },

  isMarkActive(editor: Editor, mark: string) {
    const marks = Editor.marks(editor);
    return marks ? marks[mark as keyof typeof marks] === true : false;
  },

  isCodeBlockActive(editor: Editor) {
    const [match] = Editor.nodes(editor, {
      match: (node) => Element.isElement(node) && node.type === "code",
    });

    return !!match;
  },

  toggleBoldMark(editor: Editor) {
    this.toggleMark(editor, "bold");
  },

  toggleItalicMark(editor: Editor) {
    this.toggleMark(editor, "italic");
  },

  toggleMark(editor: Editor, mark: string) {
    const isActive = CustomEditor.isMarkActive(editor, mark);
    if (isActive) {
      Editor.removeMark(editor, mark);
    } else {
      Editor.addMark(editor, mark, true);
    }
  },

  toggleCodeBlock(editor: Editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? undefined : "code" },
      {
        match: (node) =>
          Element.isElement(node) && Editor.isBlock(editor, node),
      }
    );
  },
};
