"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useComics } from "@/lib/comic-context";
import { downloadFile } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, FileArchive, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ComicGrid() {
  const { setComics, filteredComics } = useComics();

  const { data: comics } = useQuery({
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
      setComics(comics);
    }
  }, [comics, setComics]);

  const handleDownload = async (volumeId: string, volumeName: string) => {
    try {
      await downloadFile(
        `/api/download-volume?volumeId=${volumeId}`,
        `${volumeName.toLowerCase().replace(/[^a-z0-9]/gi, "_")}.zip`
      );
    } catch (error) {
      toast.error("Failed to download volume");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
      {filteredComics.length === 0 ? (
        <div className="col-span-full text-center text-muted-foreground">
          No comics found.
        </div>
      ) : (
        filteredComics.map((comic) => (
          <Card
            key={comic.id}
            className="overflow-hidden flex flex-col h-full pt-0"
          >
            <Link href={`/comics/${comic.id}`}>
              <div className="relative aspect-[2/3] w-full overflow-hidden">
                <Image
                  src={comic.image || "/placeholder.svg"}
                  alt={comic.name}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
            </Link>
            <CardContent className="p-4 flex-grow">
              <Link href={`/comics/${comic.id}`}>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg line-clamp-2 hover:underline flex-1">
                    {comic.name}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {comic.is_favorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                    {comic.is_fully_read && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                {comic.publisher}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                {comic.start_year ? `Started: ${comic.start_year}` : null}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {comic.count_of_issues
                  ? `${comic.count_of_issues} issue${
                      comic.count_of_issues !== 1 ? "s" : ""
                    }`
                  : null}
              </div>
              <div className="mt-2 text-xs text-muted-foreground line-clamp-3">
                {comic.description?.replace(/<[^>]+>/g, "")}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Link href={`/comics/${comic.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  View
                </Button>
              </Link>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() =>
                        handleDownload(comic.id.toString(), comic.name)
                      }
                    >
                      <FileArchive className="h-3.5 w-3.5" />
                      Download All
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download all issues as a zip file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}
