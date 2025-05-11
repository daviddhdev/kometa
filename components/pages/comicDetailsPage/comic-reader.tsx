"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ComicReaderProps {
  issueId: number;
  filePath: string;
  isDialogFullscreen?: boolean;
  onToggleDialogFullscreen?: () => void;
  isRead?: boolean;
  onMarkRead?: () => void;
}

export function ComicReader({
  issueId,
  filePath,
  isDialogFullscreen,
  onToggleDialogFullscreen,
  isRead,
  onMarkRead,
}: ComicReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasMarkedRead, setHasMarkedRead] = useState(false);

  // Fetch reading progress
  const { data: readingProgress } = useQuery({
    queryKey: ["reading-progress", issueId],
    queryFn: async () => {
      const response = await fetch(`/api/issues/${issueId}/progress`);
      if (!response.ok) throw new Error("Failed to fetch reading progress");
      return response.json();
    },
  });

  // Update reading progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ page, total }: { page: number; total: number }) => {
      const response = await fetch(`/api/issues/${issueId}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPage: page, totalPages: total }),
      });
      if (!response.ok) throw new Error("Failed to update progress");
      return response.json();
    },
  });

  // Load comic pages
  const { data: pages } = useQuery({
    queryKey: ["comic-pages", filePath],
    queryFn: async () => {
      const response = await fetch(`/api/issues/${issueId}/pages`);
      if (!response.ok) throw new Error("Failed to fetch comic pages");
      return response.json();
    },
  });

  useEffect(() => {
    if (readingProgress) {
      setCurrentPage(readingProgress.current_page);
    }
  }, [readingProgress]);

  useEffect(() => {
    if (pages && pages.length > 0) {
      setImageUrl(pages[currentPage - 1]);
    }
  }, [pages, currentPage]);

  const updateReadStatusMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/issues/${issueId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to update read status");
      }

      return response.json();
    },
    onSuccess: () => {
      onMarkRead?.();
      setHasMarkedRead(true);
      window.location.reload();
    },
    onError: (error) => {
      console.error("Error updating read status:", error);
      toast.error("Failed to update read status");
    },
  });

  const handlePageChange = (newPage: number) => {
    if (!pages || newPage < 1 || newPage > pages.length) return;
    setCurrentPage(newPage);
    updateProgressMutation.mutate({ page: newPage, total: pages.length });
    if (newPage === pages.length && !isRead && onMarkRead && !hasMarkedRead) {
      updateReadStatusMutation.mutate();
    }
  };

  if (!pages || pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading pages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 bg-background border-b relative rounded-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {pages.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pages.length}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleDialogFullscreen}
            className="mr-16"
          >
            {isDialogFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-black relative">
        {imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={imageUrl}
              alt={`Page ${currentPage}`}
              className="max-w-full max-h-full object-cover"
              width={1000}
              height={1500}
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </div>
        )}
      </div>

      <div className="p-4 bg-background border-t rounded-b-lg">
        <Progress value={(currentPage / pages.length) * 100} className="h-2" />
      </div>
    </div>
  );
}
