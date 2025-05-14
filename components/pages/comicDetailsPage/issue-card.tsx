"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingPlaceholder } from "@/components/ui/loading-placeholder";
import { Progress } from "@/components/ui/progress";
import { downloadFile } from "@/lib/utils";
import type { Issue } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BookOpen, Download, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ComicReader } from "./comic-reader";

interface IssueCardProps {
  issue: Issue;
  onReadStatusChange?: (issueId: number, isRead: boolean) => void;
}

export function IssueCard({
  issue: initialIssue,
  onReadStatusChange,
}: IssueCardProps) {
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isDialogFullscreen, setIsDialogFullscreen] = useState(false);
  const [issue, setIssue] = useState(initialIssue);

  // Fetch reading progress
  const { data: readingProgress } = useQuery({
    queryKey: ["reading-progress", issue.id],
    queryFn: async () => {
      const response = await fetch(`/api/issues/${issue.id}/progress`);
      if (!response.ok) throw new Error("Failed to fetch reading progress");
      return response.json();
    },
  });

  // Fetch first page for cover and total pages
  const { data: pages, isLoading: isLoadingPages } = useQuery({
    queryKey: ["comic-pages", issue.id],
    queryFn: async () => {
      const response = await fetch(`/api/issues/${issue.id}/pages`);
      if (!response.ok) throw new Error("Failed to fetch comic pages");
      return response.json();
    },
  });
  const coverUrl = pages && pages.length > 0 ? pages[0] : undefined;
  const totalPages = pages ? pages.length : 0;

  const updateReadStatusMutation = useMutation({
    mutationFn: async ({ isRead }: { isRead: boolean }) => {
      const response = await fetch(`/api/issues/${issue.id}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead }),
      });

      if (!response.ok) {
        throw new Error("Failed to update read status");
      }

      return response.json();
    },
    onSuccess: () => {
      const newIsRead = !issue.is_read;
      setIssue((prev) => ({ ...prev, is_read: newIsRead }));
      onReadStatusChange?.(issue.id, newIsRead);
    },
    onError: (error) => {
      console.error("Error updating read status:", error);
      toast.error("Failed to update read status");
      // Revert the local state on error
      setIssue((prev) => ({ ...prev, is_read: !prev.is_read }));
    },
  });

  const handleReadStatusChange = async () => {
    // Optimistically update the UI
    const newIsRead = !issue.is_read;
    onReadStatusChange?.(issue.id, newIsRead);
    await updateReadStatusMutation.mutateAsync({ isRead: newIsRead });
  };

  const handleDownload = async () => {
    try {
      await downloadFile(
        `/api/download-issue?issueId=${issue.id}`,
        issue.title || ""
      );
    } catch (error) {
      toast.error("Failed to download issue");
    }
  };

  return (
    <Card className="overflow-hidden h-full p-0">
      <CardContent className="p-0 h-full">
        <div className="flex h-full items-stretch">
          {coverUrl ? (
            <div className="relative h-full w-40 flex-shrink-0">
              <img
                src={coverUrl}
                alt={`Cover for ${issue.title}`}
                className="h-full w-full object-cover rounded-l-lg shadow-md border border-border"
              />
              <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded">
                #{issue.issue_number}
              </span>
            </div>
          ) : isLoadingPages ? (
            <div className="flex h-32 items-center justify-center">
              <LoadingPlaceholder text="Loading pages..." />
            </div>
          ) : (
            <div className="flex h-full w-40 aspect-[2/3] items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-medium text-xl rounded-l-lg border border-border shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
              <div className="relative z-10 flex flex-col items-center gap-1">
                <span className="text-2xl font-bold">
                  #{issue.issue_number}
                </span>
                <span className="text-xs text-primary/70">No Cover</span>
              </div>
            </div>
          )}
          <div className="flex-1 p-4 flex flex-col h-full">
            <div className="flex flex-col h-full">
              <div>
                <h3 className="font-medium truncate">{issue.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={issue.is_read ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {issue.is_read ? "Read" : "Unread"}
                  </Badge>
                  {totalPages > 0 && readingProgress && (
                    <span className="text-xs text-muted-foreground">
                      {readingProgress.current_page}/{totalPages}
                    </span>
                  )}
                </div>
              </div>
              <Progress
                value={
                  readingProgress
                    ? (readingProgress.current_page / totalPages) * 100
                    : 0
                }
                className="h-1 my-4"
              />
              <div className="flex items-center gap-2 mt-auto">
                <Dialog
                  open={isReaderOpen}
                  onOpenChange={(open) => {
                    setIsReaderOpen(open);
                    if (!open) setIsDialogFullscreen(false);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Read
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    hideCloseButton={isDialogFullscreen}
                    className={`p-0 flex flex-col${
                      isDialogFullscreen
                        ? " fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] z-[100] w-screen h-screen max-w-none rounded-none"
                        : " h-[90vh] max-w-7xl"
                    }`}
                  >
                    <DialogTitle className="sr-only">
                      {issue ? `Reading ${issue.title}` : "Comic Reader"}
                    </DialogTitle>
                    {issue && (
                      <div className="flex-1 min-h-0">
                        <ComicReader
                          issueId={issue.id}
                          filePath={issue.file_path || ""}
                          isDialogFullscreen={isDialogFullscreen}
                          onToggleDialogFullscreen={() =>
                            setIsDialogFullscreen((f) => !f)
                          }
                          isRead={!!issue.is_read}
                          onMarkRead={async () => {
                            if (!issue.is_read) {
                              await handleReadStatusChange();
                            }
                          }}
                        />
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleReadStatusChange}
                  disabled={updateReadStatusMutation.isPending}
                >
                  {issue.is_read ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleDownload}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
