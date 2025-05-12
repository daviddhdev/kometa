import ClientWrapper from "./client-wrapper";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientWrapper volumeId={id} />;
}
