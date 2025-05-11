import { ComicDetailsWrapper } from "@/components/pages/comicDetailsPage/comic-details-wrapper";
import { notFound } from "next/navigation";

async function getVolumeData(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/volumes/${id}`,
    {
      next: { revalidate: 60 }, // Revalidate every minute
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch volume data");
  }

  return response.json();
}

export default async function ComicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { volume, issues } = await getVolumeData(id);
  return <ComicDetailsWrapper volume={volume} issues={issues} />;
}
