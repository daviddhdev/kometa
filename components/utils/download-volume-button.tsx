"use client";

import { Button } from "@/components/ui/button";
import { downloadFile } from "@/lib/utils";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function DownloadVolumeButton({
  volumeId,
  volumeName,
}: {
  volumeId: string;
  volumeName: string;
}) {
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
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={() => handleDownload(volumeId, volumeName)}
    >
      <Download className="h-4 w-4" />
      Download
    </Button>
  );
}
