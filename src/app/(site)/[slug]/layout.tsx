import { PostShell } from "@/components/post/post-shell";

export default function SlugLayout({ children }: LayoutProps<"/[slug]">) {
  return (
    <PostShell backHref="/" backLabel="Back">
      {children}
    </PostShell>
  );
}
