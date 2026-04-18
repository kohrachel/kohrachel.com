import { PostBodyColumn, PostPageShell, PostTitle } from "@/lib/postPageLayout";
import { IPost } from "@/types";
import path from "path";
import fs from "fs";

export default async function PostPage({
  params,
}: {
  params: { postSlug: string };
}) {
  const { postSlug } = await params;
  const postFile = fs.readFileSync(
    path.join(process.cwd(), "posts", `${postSlug}.json`),
    "utf8",
  );
  const postData = JSON.parse(postFile);
  return (
    <PostPageShell>
      <PostTitle>{postData.title}</PostTitle>
      <PostBodyColumn>
        {postData.content.map(
          (
            item: { content: { type: string; text: string }[] },
            index: number,
          ) => {
            return <p key={index}>{item.content[0]?.text}</p>;
          },
        )}
      </PostBodyColumn>
    </PostPageShell>
  );
}
