import { downloadFile } from "@/lib/utils";
import { Volume } from "@/types";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { BookOpen, CheckCircle2, FileArchive, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Tooltip } from "../ui/tooltip";

interface VolumeCardProps {
  volume: Volume;
  extraButton?: React.ReactNode;
  hideActions?: boolean;
}

export const VolumeCard: React.FC<VolumeCardProps> = ({
  volume,
  extraButton,
  hideActions = false,
}) => {
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
    <Card key={volume.id} className="overflow-hidden flex flex-col h-full pt-0">
      <Link href={`/comics/${volume.id}`}>
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <Image
            src={volume.image || "/placeholder.svg"}
            alt={volume.name}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4 flex-grow">
        <Link href={`/comics/${volume.id}`}>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg line-clamp-2 hover:underline flex-1">
              {volume.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {volume.is_favorite && (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
              {volume.is_fully_read && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">{volume.publisher}</p>
        <div className="mt-2 text-xs text-muted-foreground">
          {volume.start_year ? `Started: ${volume.start_year}` : null}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {volume.count_of_issues
            ? `${volume.count_of_issues} issue${
                volume.count_of_issues !== 1 ? "s" : ""
              }`
            : null}
        </div>
        <div className="mt-2 text-xs text-muted-foreground line-clamp-3">
          {volume.description?.replace(/<[^>]+>/g, "")}
        </div>
      </CardContent>
      {!hideActions && (
        <CardFooter className="p-4 pt-0 flex items-center flex-wrap gap-2">
          <Link href={`/comics/${volume.id}`}>
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
                    handleDownload(volume.id.toString(), volume.name)
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
          {extraButton && extraButton}
        </CardFooter>
      )}
    </Card>
  );
};
