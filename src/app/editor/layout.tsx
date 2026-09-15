export default function EditorLayout({ children }: LayoutProps<"/editor">) {
  return (
    <div className="flex flex-1 flex-col px-(--page-padding-inline) pt-(--page-padding-top) pb-(--page-padding-bottom)">
      {children}
    </div>
  );
}
