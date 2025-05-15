"use client";

import { Button } from "@/components/ui/button";
import { LoadingPlaceholder } from "@/components/ui/loading-placeholder";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VolumeCard } from "@/components/utils/volume-card";
import { useComics } from "@/lib/comic-context";
import { useQuery } from "@tanstack/react-query";
import { Layout, LayoutGrid, LayoutList } from "lucide-react";
import { useEffect, useState } from "react";

type LayoutType = "grid" | "list" | "compact";

export default function ComicGrid() {
  const { setVolumes, filteredVolumes } = useComics();
  const [layout, setLayout] = useState<LayoutType>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("volumeLayout") as LayoutType) || "grid";
    }
    return "grid";
  });

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

  useEffect(() => {
    localStorage.setItem("volumeLayout", layout);
  }, [layout]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingPlaceholder text="Loading comics..." />
      </div>
    );
  }

  const getLayoutClasses = () => {
    switch (layout) {
      case "grid":
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";
      case "list":
        return "grid grid-cols-1 gap-4";
      case "compact":
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={layout === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setLayout("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Grid Layout</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={layout === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setLayout("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>List Layout</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={layout === "compact" ? "default" : "outline"}
                size="icon"
                onClick={() => setLayout("compact")}
              >
                <Layout className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Compact Layout</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className={getLayoutClasses()}>
        {filteredVolumes.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">
            No comics found.
          </div>
        ) : (
          filteredVolumes.map((comic) => (
            <VolumeCard key={comic.id} volume={comic} layout={layout} />
          ))
        )}
      </div>
    </div>
  );
}
