import CollectionPage from "@/components/pages/collection/collection-page";

export default async function Collection({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CollectionPage id={id} />;
}
