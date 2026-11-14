"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EditorContent,
  EditorContext,
  useEditor,
  type Editor,
  type JSONContent,
} from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { Typography } from "@tiptap/extension-typography";
import { FindAndReplace } from "@tiptap/extension-find-and-replace";
import { FileHandler } from "@tiptap/extension-file-handler";
import { Placeholder, Selection } from "@tiptap/extensions";

// --- UI Primitives ---
import { Button } from "@/components/tiptap/ui-primitive/button";
import { Spacer } from "@/components/tiptap/ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap/ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap/node/image-upload-node/image-upload-node-extension";
import { contentExtensions } from "@/components/post/content-extensions";
import { EditorPostImage } from "@/components/tiptap/node/image-node/editor-post-image";
import {
  insertUploadedImages,
  uploadPostImageFile,
} from "@/components/tiptap/node/image-node/upload-post-image";
import {
  POST_IMAGE_MAX_BYTES,
  POST_IMAGE_TYPES,
} from "@/domain-types/posts/image";
import "@/components/tiptap/templates/simple/editor-affordances.css";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap/ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap/ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap/ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap/ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap/ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap/ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap/ui/link-popover";
import { MarkButton } from "@/components/tiptap/ui/mark-button";
import { TextAlignButton } from "@/components/tiptap/ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap/ui/undo-redo-button";
import {
  SearchAndReplace,
  SearchAndReplaceButton,
} from "@/components/tiptap/ui/search-and-replace";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap/icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap/icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap/icons/link-icon";

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";

// --- Components ---

// --- Lib ---

// --- Styles ---
import "@/components/tiptap/templates/simple/simple-editor.scss";

const SEARCH_AND_REPLACE_SCROLL_OPTIONS: ScrollIntoViewOptions = {
  block: "center",
};

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  onSearchAndReplaceClick,
  isSearchAndReplaceOpen,
  searchAndReplaceButtonRef,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  onSearchAndReplaceClick: () => void;
  isSearchAndReplaceOpen: boolean;
  searchAndReplaceButtonRef: React.RefObject<HTMLButtonElement | null>;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <SearchAndReplaceButton
          ref={searchAndReplaceButtonRef}
          aria-expanded={isSearchAndReplaceOpen}
          data-active-state={isSearchAndReplaceOpen ? "on" : "off"}
          onClick={onSearchAndReplaceClick}
        />
      </ToolbarGroup>
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

const IMAGE_MIME_TYPES = Object.keys(POST_IMAGE_TYPES);

export function SimpleEditor({
  onEditorReady,
  onImageError,
  initialContent,
}: {
  onEditorReady?: (editor: Editor) => void;
  onImageError?: (error: Error) => void;
  initialContent?: JSONContent;
} = {}) {
  const onImageErrorRef = useRef(onImageError);
  useEffect(() => {
    onImageErrorRef.current = onImageError;
  });
  const reportImageError = (error: Error) => {
    console.warn("Image upload failed:", error);
    onImageErrorRef.current?.(error);
  };

  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main",
  );
  const [isSearchAndReplaceOpen, setIsSearchAndReplaceOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const searchAndReplaceButtonRef = useRef<HTMLButtonElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      ...contentExtensions.map((extension) =>
        extension.name === EditorPostImage.name ? EditorPostImage : extension,
      ),
      Typography,
      Selection,
      FindAndReplace.configure({
        searchDebounceMs: 500,
        injectCSS: false,
      }),
      ImageUploadNode.configure({
        accept: IMAGE_MIME_TYPES.join(","),
        maxSize: POST_IMAGE_MAX_BYTES,
        limit: 3,
        upload: uploadPostImageFile,
        onError: (error) => console.warn("Image upload failed:", error),
      }),
      FileHandler.configure({
        allowedMimeTypes: IMAGE_MIME_TYPES,
        onPaste: (editor, files, htmlContent) => {
          if (htmlContent) return false;
          insertUploadedImages(
            editor,
            files,
            editor.state.selection.anchor,
            reportImageError,
          );
        },
        onDrop: (editor, files, pos) => {
          insertUploadedImages(editor, files, pos, reportImageError);
        },
      }),
      Placeholder.configure({
        placeholder: "enter some text here! :)"
      })
    ],
    // A doc with no blocks (e.g. a new post) loads as-is, with nothing to
    // type into and nothing to show the placeholder on. Start it with one
    // empty paragraph instead.
    content: initialContent?.content?.length
      ? initialContent
      : { type: "doc", content: [{ type: "paragraph" }] },
  });

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  const openSearchAndReplace = useCallback(() => {
    setMobileView("main");
    setIsSearchAndReplaceOpen(true);
  }, []);

  const closeSearchAndReplace = useCallback(() => {
    setIsSearchAndReplaceOpen(false);
    searchAndReplaceButtonRef.current?.focus();
  }, []);

  const toggleSearchAndReplace = useCallback(() => {
    if (isSearchAndReplaceOpen) {
      closeSearchAndReplace();
      return;
    }

    openSearchAndReplace();
  }, [closeSearchAndReplace, isSearchAndReplaceOpen, openSearchAndReplace]);

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              onSearchAndReplaceClick={toggleSearchAndReplace}
              isSearchAndReplaceOpen={isSearchAndReplaceOpen}
              searchAndReplaceButtonRef={searchAndReplaceButtonRef}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <SearchAndReplace
          className="simple-editor-search-and-replace"
          open={isSearchAndReplaceOpen}
          onOpen={openSearchAndReplace}
          onClose={closeSearchAndReplace}
          scrollIntoViewOptions={SEARCH_AND_REPLACE_SCROLL_OPTIONS}
        />

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  );
}
