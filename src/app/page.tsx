import { listPosts } from "@/server/posts/list";

export default async function Home() {
  const posts = await listPosts({});

  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{JSON.stringify(post)}</li>
        ))}
      </ul>
    </main>
  );
}
