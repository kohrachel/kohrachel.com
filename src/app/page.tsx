import Link from "next/link";
import styled from "styled-components";

export default function HomePage() {
  return (
    <Home>
      <Content>
        <PostDrawer>
          <PostChip>
            <PostTitle href="/the-overwhelming-anarchy-of-adulthood">
              the overwhelming anarchy of adulthood
            </PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle href="/the-overwhelming-anarchy-of-adulthood">
              the overwhelming anarchy of adulthood
            </PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle href="/the-overwhelming-anarchy-of-adulthood">
              the overwhelming anarchy of adulthood
            </PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle href="/the-overwhelming-anarchy-of-adulthood">
              the overwhelming anarchy of adulthood
            </PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle href="/the-overwhelming-anarchy-of-adulthood">
              the overwhelming anarchy of adulthood
            </PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle href="/the-overwhelming-anarchy-of-adulthood">
              the overwhelming anarchy of adulthood
            </PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle href="/the-overwhelming-anarchy-of-adulthood">
              the overwhelming anarchy of adulthood
            </PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle href="/the-overwhelming-anarchy-of-adulthood">
              the overwhelming anarchy of adulthood
            </PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
        </PostDrawer>
      </Content>
    </Home>
  );
}

const Home = styled.main`
  font-size: 1rem;
  line-height: 1.6;
`;

const Content = styled.div`
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
  font-weight: 600;
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
