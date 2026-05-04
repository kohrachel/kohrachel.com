import {
  PostBodyColumn,
  PostPageShell,
  PostTitle,
  PostHeaderSection,
  TitleAndBackButtonWrapper,
  BackButton,
} from "@/lib/postPageLayout";
import { IPost } from "@/types";
import path from "path";
import Clouds from "@components/Clouds";
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
  const postData: IPost = JSON.parse(postFile);
  return (
    <PostPageShell>
      <PostHeaderSection>
        <TitleAndBackButtonWrapper>
          <BackButton href="/">← go back</BackButton>
          <PostTitle>{postData.title}</PostTitle>
        </TitleAndBackButtonWrapper>
        <Clouds width="5120" height="357" />
      </PostHeaderSection>

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
