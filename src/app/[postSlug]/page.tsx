import styled from "styled-components";

export default function PostPage() {
  return (
    <Post>
      <Title>Title</Title>
      <Content>
        <p>Content</p>
      </Content>
    </Post>
  );
}

const Post = styled.main`
  font-size: 1rem;
  line-height: 1.5;
  padding: 6rem;
`;

const Title = styled.span`
  font-size: 1.5rem;
  line-height: 1.5;
`;

const Content = styled.div`
  font-size: 1rem;
  line-height: 1.5;
`;
