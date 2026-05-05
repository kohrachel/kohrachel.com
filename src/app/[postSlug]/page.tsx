import {
  PostBodyColumn,
  PostPageShell,
  PostTitle,
  PostHeaderSection,
  TitleAndBackButtonWrapper,
  BackButton,
} from "@/lib/postPageLayout";
import { IPost } from "@/types";
import { JSONContent } from "@tiptap/core";
import path from "path";
import Clouds from "@components/Clouds";
import fs from "fs";
import { createElement } from "react";
import styled from "styled-components";

function renderInlineContent(node: JSONContent): React.ReactNode {
  return node.content?.map((child) => child.text ?? null) ?? null;
}

function renderNode(node: JSONContent, index: number): React.ReactNode {
  switch (node.type) {
    case "heading": {
      const level = Math.min(Math.max(node.attrs?.level ?? 1, 1), 6);
      return createElement(
        `h${level}`,
        { key: index },
        renderInlineContent(node),
      );
    }
    case "paragraph":
      return <p key={index}>{renderInlineContent(node)}</p>;
    case "bulletList":
      return (
        <ul key={index}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={index} start={node.attrs?.start ?? 1}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </ol>
      );
    case "listItem":
      return (
        <li key={index}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </li>
      );
    default:
      return null;
  }
}

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
        {(postData.content as JSONContent[]).map((node, index) =>
          renderNode(node, index),
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
