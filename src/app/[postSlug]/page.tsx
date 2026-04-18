import styled from "styled-components";

export default function PostPage() {
  return (
    <Post>
      <Title>the overwhelming anarchy of adulthood</Title>
      <PostContent>
        <p>
          Do do voluptate Lorem pariatur elit ut veniam. Reprehenderit velit
          Lorem cillum et minim incididunt fugiat duis. Veniam duis sint dolor
          do culpa id eu excepteur. Aute culpa commodo voluptate irure anim
          sint. Occaecat minim ipsum sint non do cupidatat tempor officia non
          occaecat aute laboris. Exercitation amet deserunt fugiat nostrud
          eiusmod id incididunt adipisicing irure occaecat Lorem sit do. Labore
          proident eiusmod Lorem esse.
        </p>
        <p>
          Do do voluptate Lorem pariatur elit ut veniam. Reprehenderit velit
          Lorem cillum et minim incididunt fugiat duis. Veniam duis sint dolor
          do culpa id eu excepteur. Aute culpa commodo voluptate irure anim
          sint. Occaecat minim ipsum sint non do cupidatat tempor officia non
          occaecat aute laboris. Exercitation amet deserunt fugiat nostrud
          eiusmod id incididunt adipisicing irure occaecat Lorem sit do. Labore
          proident eiusmod Lorem esse.
        </p>
        <p>
          Do do voluptate Lorem pariatur elit ut veniam. Reprehenderit velit
          Lorem cillum et minim incididunt fugiat duis. Veniam duis sint dolor
          do culpa id eu excepteur. Aute culpa commodo voluptate irure anim
          sint. Occaecat minim ipsum sint non do cupidatat tempor officia non
          occaecat aute laboris. Exercitation amet deserunt fugiat nostrud
          eiusmod id incididunt adipisicing irure occaecat Lorem sit do. Labore
          proident eiusmod Lorem esse.
        </p>
      </PostContent>
    </Post>
  );
}

const Post = styled.main`
  font-size: 2rem;
  line-height: 1.25;
  padding-inline: var(--page-padding-inline);
  padding-top: var(--page-padding-top);
  padding-bottom: var(--page-padding-bottom);
  display: flex;
  flex-direction: column;
  gap: 5rem;
  align-items: center;
`;

const Title = styled.span`
  font-size: 2rem;
  line-height: 1.5;
`;

const PostContent = styled.div`
  font-size: 1rem;
  line-height: 1.5;
  text-align: start;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2.3rem;
`;
