import Tiptap from "@components/TipTap";
import {
  PostBodyColumn,
  PostPageShell,
  PostTitleInput,
} from "@/lib/postPageLayout";

export default function EditorPage() {
  return (
    <PostPageShell>
      <PostTitleInput
        name="title"
        placeholder="[untitled blog]"
        autoComplete="off"
        aria-label="Post title"
      />
      <PostBodyColumn>
        <Tiptap />
      </PostBodyColumn>
    </PostPageShell>
  );
}
