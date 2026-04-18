import Tiptap from "@components/TipTap";
import styled from "styled-components";

export default function EditorPage() {
  return (
    <Editor>
      <Tiptap />
    </Editor>
  );
}

const Editor = styled.div`
  width: 100%;
  height: 100%;
  padding: var(--page-padding-inline);
  background-color: blue;
`;
