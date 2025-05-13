"use client";

import { useComics } from "@/lib/comic-context";
import { useEffect } from "react";
import { VolumeCard } from "./utils/volume-card";

export default function ComicGrid() {
  const { setVolumes, filteredVolumes } = useComics();

  useEffect(() => {
    fetch("/api/volumes")
      .then((res) => res.json())
      .then(setVolumes);
  }, [setVolumes]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
      {filteredVolumes.length === 0 ? (
        <div className="col-span-full text-center text-muted-foreground">
          No comics found.
        </div>
      ) : (
        filteredVolumes.map((volume) => (
          <VolumeCard key={volume.id} volume={volume} />
        ))
      )}
    </div>
  );
}
