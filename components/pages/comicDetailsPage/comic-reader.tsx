"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingPlaceholder } from "@/components/ui/loading-placeholder";
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
  Pause,
  Play,
  ZoomIn,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(5);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout>(null);
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
  const { data: pages, isLoading } = useQuery({
    queryKey: ["comic-pages", filePath],
    queryFn: async () => {
      const response = await fetch(`/api/issues/${issueId}/pages`);
      if (!response.ok) throw new Error("Failed to fetch comic pages");
      return response.json();
    },
  });

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

  const handlePageChange = useCallback(
    (newPage: number, isAutoPlayNavigation = false) => {
      if (!pages || newPage < 1 || newPage > pages.length) return;

      // Only stop auto-play if this is a manual navigation
      if (isAutoPlaying && !isAutoPlayNavigation) {
        setIsAutoPlaying(false);
      }

      setPreviousPage(currentPage);
      setCurrentPage(newPage);
      updateProgressMutation.mutate({ page: newPage, total: pages.length });
      if (newPage === pages.length && !isRead && onMarkRead && !hasMarkedRead) {
        updateReadStatusMutation.mutate();
      }
    },
    [
      pages,
      isAutoPlaying,
      currentPage,
      updateProgressMutation,
      isRead,
      onMarkRead,
      hasMarkedRead,
      updateReadStatusMutation,
    ]
  );

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayIntervalRef.current = setInterval(() => {
        // Stop auto-play if we're at the last page
        if (currentPage >= (pages?.length || 0)) {
          setIsAutoPlaying(false);
          return;
        }
        handlePageChange(currentPage + 1, true);
      }, autoPlaySpeed * 1000);
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [
    isAutoPlaying,
    autoPlaySpeed,
    currentPage,
    handlePageChange,
    pages?.length,
  ]);

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
    handlePageChange(pageNumber, false);
    setPageInput("");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handlePageChange(currentPage + 1, false);
      } else if (e.key === "ArrowLeft") {
        handlePageChange(currentPage - 1, false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, pages]);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(e.target.value);
    if (!isNaN(newSpeed) && newSpeed >= 1 && newSpeed <= 30) {
      setAutoPlaySpeed(newSpeed);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingPlaceholder text="Loading pages..." />
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
              onClick={toggleAutoPlay}
              className={isAutoPlaying ? "bg-primary/10" : ""}
            >
              {isAutoPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={autoPlaySpeed}
                onChange={handleSpeedChange}
                className="w-16 h-8"
                min={1}
                max={30}
              />
              <span className="text-sm text-muted-foreground">sec</span>
            </div>

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
                  onClick={toggleAutoPlay}
                  className={isAutoPlaying ? "bg-primary/10" : ""}
                >
                  {isAutoPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={autoPlaySpeed}
                    onChange={handleSpeedChange}
                    className="w-16 h-8"
                    min={1}
                    max={30}
                  />
                  <span className="text-sm text-muted-foreground">sec</span>
                </div>

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
