import Link from "next/link";
import styled from "styled-components";

export default function HomePage() {
  return (
    <Home>
      <Header>
        <div className="backdrop" aria-hidden />
        <BrandLink href="/">rachel koh</BrandLink>
      </Header>
      <Content>
        <PostDrawer>
          <PostChip>
            <PostTitle>the overwhelming anarchy of adulthood</PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle>the overwhelming anarchy of adulthood</PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle>the overwhelming anarchy of adulthood</PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle>the overwhelming anarchy of adulthood</PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle>the overwhelming anarchy of adulthood</PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle>the overwhelming anarchy of adulthood</PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle>the overwhelming anarchy of adulthood</PostTitle>
            <PostDescription>
              I&apos;m not sure if it&apos;s just me, but it seems like
              adulthood is a constant stream of overwhelming chaos. There&apos;s
              always so much to do and so little time to do it.
            </PostDescription>
          </PostChip>
          <PostChip>
            <PostTitle>the overwhelming anarchy of adulthood</PostTitle>
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

const Header = styled.header`
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-left: 10rem;
  padding-right: 10rem;
  width: 100%;
  position: fixed;

  .backdrop {
    position: absolute;
    z-index: 0;
    inset: 0;
    height: 200%;
    background: linear-gradient(
      to bottom,
      var(--background) 0%,
      transparent 50%
    );
    backdrop-filter: blur(12px);
    mask-image: linear-gradient(to bottom, black 0% 50%, transparent 50% 100%);
    pointer-events: none;
  }
`;

/* In-flow content is painted before position:absolute siblings; z-index lifts the title above .backdrop. */
const BrandLink = styled(Link)`
  position: relative;
  z-index: 1;
  color: var(--foreground);
`;

const Home = styled.main`
  font-size: 1rem;
  line-height: 1.5;
`;

const Content = styled.div`
  padding-left: 10rem;
  padding-right: 10rem;
  padding-top: 6rem;
  padding-bottom: 6rem;
`;

const PostDrawer = styled.div`
  font-size: 1.5rem;
  line-height: 1.5;
  color: var(--foreground);
  gap: 2rem;
  display: flex;
  flex-direction: column;
`;

const PostChip = styled.div`
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--foreground);
  padding: 0.5rem 1rem;
`;

const PostTitle = styled.h1`
  font-size: 1.5rem;
  line-height: 1.5;
`;

const PostDescription = styled.p`
  font-size: 1rem;
  line-height: 1.5;
`;
