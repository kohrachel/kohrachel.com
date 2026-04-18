import Link from "next/link";
import styled from "styled-components";
import { IPost } from "@/types";
import path from "path";
import fs from "fs";
import { ButtonLink } from "@/components/Button";

const isDev = process.env.NODE_ENV === "development";

export default function HomePage() {
  const posts: IPost[] = fs
    .readdirSync(path.join(process.cwd(), "posts"))
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const content = fs.readFileSync(
        path.join(process.cwd(), "posts", file),
        "utf8",
      );
      const post = JSON.parse(content);
      return {
        title: post.title,
        slug: post.slug,
        content: post.content,
      };
    });
  return (
    <Home>
      {isDev && (
        <CreatePostButton href="/editor">Create new post</CreatePostButton>
      )}
      <PostDrawer>
        {posts.map((post) => (
          <PostChip key={post.slug}>
            <PostTitle href={`/${post.slug}`}>{post.title}</PostTitle>
            <PostDescription>
              {post.content[0]?.content[0]?.text.slice(0, 100)}...
            </PostDescription>
          </PostChip>
        ))}
      </PostDrawer>
    </Home>
  );
}

const Home = styled.main`
  font-size: 1rem;
  line-height: 1.6;
  padding-inline: var(--page-padding-inline);
  padding-top: var(--page-padding-top);
  padding-bottom: var(--page-padding-bottom);
`;

const PostDrawer = styled.div`
  font-size: 1.5rem;
  line-height: 1.5;
  color: var(--foreground);
  gap: 1.5rem;
  display: flex;
  flex-direction: column;
`;

const PostChip = styled.article`
  font-size: 0.8rem;
  line-height: 1.55;
  color: var(--foreground);
  padding: var(--card-padding-block) var(--card-padding-inline);
`;

const PostTitle = styled(Link)`
  display: inline-block;
  font-size: 1.35rem;
  line-height: 1.35;
  font-weight: 800;
  color: var(--foreground);
  margin-bottom: 0.5rem;
  transition: color 0.15s ease;

  &:hover {
    text-decoration: underline;
    text-decoration-color: var(--purple);
    text-decoration-thickness: 2px;
    text-decoration-style: solid;
  }
`;

const PostDescription = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--comment);
`;

const CreatePostButton = styled(ButtonLink)`
  margin: var(--page-padding-inline) 0;
`;
