import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { ComicVineVolume } from "./types";

interface VolumeInfoCardProps {
  selectedVolume: ComicVineVolume | null;
}

export default function VolumeInfoCard({
  selectedVolume,
}: VolumeInfoCardProps) {
  if (!selectedVolume) return null;
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative aspect-[2/3] w-32 md:w-40 h-auto overflow-hidden rounded-lg border-2 border-muted-foreground/25">
            {selectedVolume.image?.original_url ? (
              <Image
                src={selectedVolume.image.original_url}
                alt={selectedVolume.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <p className="text-sm text-muted-foreground">No cover image</p>
              </div>
            )}
          </div>
          <div className="flex-1 grid gap-4">
            <div>
              <Label>Title</Label>
              <div className="text-sm py-2 px-3 bg-muted rounded-md">
                {selectedVolume.name}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Publisher</Label>
                <div className="text-sm py-2 px-3 bg-muted rounded-md">
                  {selectedVolume.publisher?.name || "No publisher available"}
                </div>
              </div>
              <div>
                <Label>Start Year</Label>
                <div className="text-sm py-2 px-3 bg-muted rounded-md">
                  {selectedVolume.start_year || "Not available"}
                </div>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <div className="text-sm py-2 px-3 bg-muted rounded-md whitespace-pre-wrap">
                {selectedVolume.description?.replace(/<[^>]+>/g, "") ||
                  "No description available"}
              </div>
            </div>
            <div>
              <Label>Total Issues</Label>
              <div className="text-sm py-2 px-3 bg-muted rounded-md">
                {selectedVolume.count_of_issues}{" "}
                {selectedVolume.count_of_issues === 1 ? "issue" : "issues"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
