import { ComicVineVolume } from "@/components/pages/uploadPage/types";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";
import Image from "next/image";

interface VolumeInfoCardProps {
  selectedVolume: ComicVineVolume | null;
}

export default function VolumeInfoCard({
  selectedVolume,
}: VolumeInfoCardProps) {
  if (!selectedVolume) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mb-2" />
            <p>Select a volume to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-8 md:items-center w-full">
          <div className="relative w-32 md:w-48 h-64 md:h-80 overflow-hidden rounded-lg border-2 border-muted-foreground/25 flex-shrink-0 mx-auto md:mx-0">
            {selectedVolume.image?.original_url ? (
              <Image
                src={selectedVolume.image.original_url}
                alt={selectedVolume.name}
                fill
                className="object-cover"
                style={{ objectPosition: "top" }}
              />
            ) : (
              <div className="text-center p-4">
                <p className="text-sm text-muted-foreground">No cover image</p>
              </div>
            )}
          </div>

          <div className="space-y-4 flex-1 min-w-0 w-full">
            <div>
              <Label>Title</Label>
              <div className="text-sm py-2 px-3 bg-muted rounded-md break-words">
                {selectedVolume.name}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="text-sm py-2 px-3 bg-muted rounded-md whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
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
