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
import styled from "styled-components";

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
          <PublishedAt>
            {new Date(postData.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </PublishedAt>
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

const PublishedAt = styled.span`
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--header);
`;
