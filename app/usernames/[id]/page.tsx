import { UsernameDetailView } from "@/components/UsernameDetailView";

export default async function UsernameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;

  return (
    <main className="page-frame">
      <UsernameDetailView handle={resolved.id} />
    </main>
  );
}
