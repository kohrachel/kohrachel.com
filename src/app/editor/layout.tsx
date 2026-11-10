export default function EditorLayout({ children }: LayoutProps<"/editor">) {
  // Horizontal padding is set per page: the post list uses fixed values so it
  // can be wider than the post page, and the post editor uses the post page's
  // `--page-padding-inline` so it matches the live layout.
  return (
    <div className="flex flex-1 flex-col pt-(--page-padding-top) pb-(--page-padding-bottom)">
      {children}
    </div>
  );
}
