import {
  PostBodyColumn,
  PostPageShell,
  PostTitle,
  PostHeaderSection,
  TitleAndBackButtonWrapper,
  BackButton,
} from "@/lib/postPageLayout";
import type { IPost } from "@/types";
import type { JSONContent } from "@tiptap/core";
import path from "path";
import Clouds from "@components/Clouds";
import fs from "fs";
import { createElement } from "react";
import styled from "styled-components";

function renderInlineContent(node: JSONContent): React.ReactNode {
  return node.content?.map((child) => child.text ?? null) ?? null;
}

function getTableCellProps(node: JSONContent) {
  const width = Array.isArray(node.attrs?.colwidth)
    ? node.attrs?.colwidth[0]
    : undefined;

  return {
    colSpan: node.attrs?.colspan ?? 1,
    rowSpan: node.attrs?.rowspan ?? 1,
    style: width ? { width: `${width}px` } : undefined,
  };
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
    case "table":
      return (
        <div className="tableWrapper" key={index}>
          <table>
            <tbody>{node.content?.map((child, i) => renderNode(child, i))}</tbody>
          </table>
        </div>
      );
    case "tableRow":
      return <tr key={index}>{node.content?.map((child, i) => renderNode(child, i))}</tr>;
    case "tableHeader":
      return (
        <th key={index} {...getTableCellProps(node)}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </th>
      );
    case "tableCell":
      return (
        <td key={index} {...getTableCellProps(node)}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </td>
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
