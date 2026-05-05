import Link from "next/link";
import styled from "styled-components";
import { IPost } from "@/types";
import path from "path";
import fs from "fs";
import { ButtonLink } from "@components/Button";
import { media } from "@/styles/breakpoints";

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
        publishedAt: post.publishedAt,
      };
    });
  return (
    <Home>
      <Title>rachel koh</Title>
      {isDev && (
        <CreatePostButton href="/editor">
          [DEV] Create new post
        </CreatePostButton>
      )}
      <BentoBox>
        <PostDrawer>
          <SectionTitle>Posts</SectionTitle>
          {posts.map((post) => (
            <PostChip key={post.slug}>
              <PostTitle href={`/${post.slug}`}>{post.title}</PostTitle>
              <p>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </PostChip>
          ))}
        </PostDrawer>
        <Categories>
          <SectionTitle>Categories</SectionTitle>
          coming soon
        </Categories>
        <AboutMe>
          <SectionTitle>About Me</SectionTitle>
          <p>
            Builder at heart. Lover of matcha, Taylor Swift, and cozy nights.
          </p>
        </AboutMe>
      </BentoBox>
    </Home>
  );
}

const Home = styled.main`
  font-size: 1rem;
  padding-inline: var(--page-padding-inline);
  padding-top: var(--page-padding-vertical);
  padding-bottom: var(--page-padding-vertical);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4rem;
`;

const BentoBox = styled.section`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    "posts categories"
    "posts about-me";
  gap: 2rem;
  width: 100%;
  height: 100%;

  ${media.sm} {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      "posts"
      "categories"
      "about-me";
  }
`;

const Title = styled.h1`
  font-size: clamp(3rem, 2rem + 10vw, 7rem);
  text-align: center;
  line-height: 1;
  color: var(--accent);
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.75rem, 0.75rem + 2.5vw, 2.5rem);
  line-height: 1;
  color: var(--primary);
  -webkit-text-stroke: 10px var(--background);
  paint-order: stroke fill;
  z-index: 10;
  width: fit-content;
  background-color: var(--background);
  position: absolute;
  top: 0;
  left: 1.3rem;
  transform: translateY(-50%);
  user-select: none;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  outline: 2.5px solid var(--primary);
  border-radius: 16px;
  position: relative;
  padding: var(--card-padding-block) var(--card-padding-inline);

  transition: outline-color 0.5s ease;

  &:hover {
    outline-color: color-mix(in srgb, var(--accent) 80%, var(--tertiary));
  }
`;

const PostDrawer = styled(Section)`
  font-size: 1.5rem;
  line-height: 1.5;
  color: var(--foreground);
  gap: 2rem;
  display: flex;
  flex-direction: column;
  grid-area: posts;
  min-height: max-content;
`;

const Categories = styled(Section)`
  grid-area: categories;
`;

const AboutMe = styled(Section)`
  grid-area: about-me;
`;
const PostChip = styled.article`
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--foreground);
`;

const PostTitle = styled(Link)`
  display: inline-block;
  font-size: 1.35rem;
  line-height: 1.35;
  font-weight: 800;
  color: var(--foreground);
  transition: color 0.15s ease;

  &:hover {
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 2px;
    text-decoration-style: solid;
    text-underline-offset: 4px;
  }
`;

const PostDescription = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
`;

const CreatePostButton = styled(ButtonLink)`
  position: absolute;
  top: 1rem;
  right: 1rem;
`;
