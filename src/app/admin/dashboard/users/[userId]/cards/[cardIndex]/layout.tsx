export default function AdminCardEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="-m-8 min-h-[calc(100vh-4rem)]">{children}</div>;
}
