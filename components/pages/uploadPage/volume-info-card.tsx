import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { VolumeInfoCardProps } from "@/types";
import Image from "next/image";

export default function VolumeInfoCard({
  selectedVolume,
}: VolumeInfoCardProps) {
  if (!selectedVolume) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="relative w-32 h-48 flex-shrink-0">
            <Image
              src={selectedVolume.image?.original_url || "/placeholder.svg"}
              alt={selectedVolume.name}
              fill
              className="object-cover rounded-md"
            />
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
