export default function SlugLayout({ children }: LayoutProps<"/[slug]">) {
  return (
    <div className="flex flex-1 flex-col px-(--page-padding-inline) pt-(--page-padding-top) pb-(--page-padding-bottom)">
      {children}
    </div>
  );
}
