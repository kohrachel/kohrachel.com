"use client";

import type { Editor } from "@tiptap/react";
import { useCurrentEditor, useEditorState } from "@tiptap/react";
import { useCallback, useSyncExternalStore } from "react";

function getActivePageEditor(editor: Editor): Editor | null {
  const storage = editor.storage as unknown as Record<string, unknown>;
  const pages = storage.pages as { activeEditor?: Editor | null } | undefined;
  if (!pages || !("activeEditor" in pages)) return null;
  return pages.activeEditor ?? null;
}

export function useTiptapEditor(providedEditor?: Editor | null): {
  editor: Editor | null;
  editorState?: Editor["state"];
  canCommand?: Editor["can"];
} {
  const { editor: coreEditor } = useCurrentEditor();
  const mainEditor = providedEditor ?? coreEditor;

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!mainEditor) return () => {};

      mainEditor.on("update", onChange);
      mainEditor.on("selectionUpdate", onChange);
      mainEditor.on("destroy", onChange);

      return () => {
        mainEditor.off("update", onChange);
        mainEditor.off("selectionUpdate", onChange);
        mainEditor.off("destroy", onChange);
      };
    },
    [mainEditor],
  );

  const getSnapshot = useCallback(
    () => (mainEditor ? getActivePageEditor(mainEditor) : null),
    [mainEditor],
  );

  const storageEditor = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => null,
  );

  const editorState = useEditorState({
    editor: storageEditor ?? mainEditor,
    selector(context) {
      if (!context.editor) {
        return { editor: null, editorState: undefined, canCommand: undefined };
      }

      return {
        editor: context.editor,
        editorState: context.editor.state,
        canCommand: context.editor.can,
      };
    },
  });

  return editorState ?? { editor: null };
}
