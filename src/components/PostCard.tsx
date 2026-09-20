interface PostCardProps {
  title?: string | null;
  description?: string | null;
}

export default function PostCard({ title, description }: PostCardProps) {
  return (
    <article>
      <h2>{title ?? "Untitled"}</h2>
      {description ? <p>{description}</p> : null}
    </article>
  );
}
