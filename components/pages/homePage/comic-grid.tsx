"use client";

import { LoadingPlaceholder } from "@/components/ui/loading-placeholder";
import { VolumeCard } from "@/components/utils/volume-card";
import { useComics } from "@/lib/comic-context";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function ComicGrid() {
  const { setVolumes, filteredVolumes } = useComics();

  const { data: comics, isLoading } = useQuery({
    queryKey: ["volumes"],
    queryFn: async () => {
      const response = await fetch("/api/volumes");
      if (!response.ok) {
        throw new Error("Failed to fetch volumes");
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (comics) {
      setVolumes(comics);
    }
  }, [comics, setVolumes]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingPlaceholder text="Loading comics..." />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
      {filteredVolumes.length === 0 ? (
        <div className="col-span-full text-center text-muted-foreground">
          No comics found.
        </div>
      ) : (
        filteredVolumes.map((comic) => (
          <VolumeCard key={comic.id} volume={comic} />
        ))
      )}
    </div>
  );
}
