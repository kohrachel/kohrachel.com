import { Suspense } from "react";
import { EditorWithSave } from "./editor-with-save";

export default function Page() {
  // The Tiptap editor is a client component that reads unstable values
  // (e.g. Math.random()) during render. Under Cache Components/PPR this must
  // stream as dynamic content rather than be prerendered into the static shell.
  return (
    <Suspense fallback={null}>
      <EditorWithSave />
    </Suspense>
  );
}
