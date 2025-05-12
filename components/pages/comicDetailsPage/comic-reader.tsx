"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Maximize2,
  Minimize2,
  ZoomIn,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ZoomLens } from "./comic-reader-zoom";

interface ComicReaderProps {
  issueId: number;
  filePath: string;
  isDialogFullscreen?: boolean;
  onToggleDialogFullscreen?: () => void;
  isRead?: boolean;
  onMarkRead?: () => Promise<void>;
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
  const [previousPage, setPreviousPage] = useState(1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasMarkedRead, setHasMarkedRead] = useState(false);
  const [pageInput, setPageInput] = useState("");
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handlePageChange(currentPage + 1);
      } else if (e.key === "ArrowLeft") {
        handlePageChange(currentPage - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, pages]);

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
        console.error("Failed to update read status:", response);
        throw new Error("Failed to update read status");
      }

      return response.json();
    },
    onSuccess: async () => {
      await onMarkRead?.();
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
    setPreviousPage(currentPage);
    setCurrentPage(newPage);
    updateProgressMutation.mutate({ page: newPage, total: pages.length });
    if (newPage === pages.length && !isRead && onMarkRead && !hasMarkedRead) {
      updateReadStatusMutation.mutate();
    }
  };

  const handlePageJump = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput);
    if (isNaN(pageNumber)) {
      toast.error("Please enter a valid page number");
      return;
    }
    if (pageNumber < 1 || pageNumber > pages.length) {
      toast.error(`Page number must be between 1 and ${pages.length}`);
      return;
    }
    handlePageChange(pageNumber);
    setPageInput("");
  };

  if (!pages || pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading pages...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      {!isDialogFullscreen && (
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

            <form onSubmit={handlePageJump} className="flex items-center gap-2">
              <Input
                type="number"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder={`1-${pages?.length || "?"}`}
                className="w-20 h-8"
                min={1}
                max={pages?.length}
              />
              <Button type="submit" variant="outline" size="sm">
                Go
              </Button>
            </form>
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
              onClick={() => setIsZoomEnabled(!isZoomEnabled)}
              className={isZoomEnabled ? "bg-primary/10" : ""}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={onToggleDialogFullscreen}
            >
              {isDialogFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="space-y-1">
                    <p>Keyboard shortcuts:</p>
                    <p>← Previous page</p>
                    <p>→ Next page</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      <ZoomLens
        imageUrl={imageUrl}
        isEnabled={isZoomEnabled}
        containerRef={containerRef}
        imageRef={imageRef}
        currentPage={currentPage}
        previousPage={previousPage}
      />

      {!isDialogFullscreen && (
        <div className="p-4 bg-background border-t rounded-b-lg">
          <Progress
            value={(currentPage / pages.length) * 100}
            className="h-2"
          />
        </div>
      )}

      {isDialogFullscreen && (
        <>
          <div className="absolute top-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-200 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <form
                  onSubmit={handlePageJump}
                  className="flex items-center gap-2"
                >
                  <Input
                    type="number"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    placeholder={`1-${pages?.length || "?"}`}
                    className="w-20 h-8"
                    min={1}
                    max={pages?.length}
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Go
                  </Button>
                </form>
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
                  onClick={() => setIsZoomEnabled(!isZoomEnabled)}
                  className={isZoomEnabled ? "bg-primary/10" : ""}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={onToggleDialogFullscreen}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>

                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Keyboard className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <div className="space-y-1">
                        <p>Keyboard shortcuts:</p>
                        <p>← Previous page</p>
                        <p>→ Next page</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-200 z-10">
            <Progress
              value={(currentPage / pages.length) * 100}
              className="h-2"
            />
          </div>
        </>
      )}
    </div>
  );
}
