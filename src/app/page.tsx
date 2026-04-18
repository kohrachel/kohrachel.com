import styled from "styled-components";

export default function Home() {
  return (
    <Content>
      <PostTitle>hello</PostTitle>
      world
    </Content>
  );
}

const Content = styled.div`
  font-size: 1.5rem;
  line-height: 1.5;
  color: var(--foreground);
  background: blue; // var(--background);
`;

const PostTitle = styled.h1`
  font-size: 1.5rem;
  line-height: 1.5;
  color: var(--foreground);
  background: blue; // var(--background);
`;
