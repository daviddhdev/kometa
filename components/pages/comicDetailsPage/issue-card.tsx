"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { downloadFile } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Download, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface IssueCardProps {
  issue: {
    id: number;
    number: number;
    title: string;
    isRead: boolean;
  };
  onReadStatusChange?: (issueId: number, isRead: boolean) => void;
}

export function IssueCard({
  issue: initialIssue,
  onReadStatusChange,
}: IssueCardProps) {
  const [issue, setIssue] = useState(initialIssue);

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
      const newIsRead = !issue.isRead;
      setIssue((prev) => ({ ...prev, isRead: newIsRead }));
      onReadStatusChange?.(issue.id, newIsRead);
    },
    onError: (error) => {
      console.error("Error updating read status:", error);
      toast.error("Failed to update read status");
      // Revert the local state on error
      setIssue((prev) => ({ ...prev, isRead: !prev.isRead }));
    },
  });

  const handleReadStatusChange = () => {
    // Optimistically update the UI
    const newIsRead = !issue.isRead;
    onReadStatusChange?.(issue.id, newIsRead);
    updateReadStatusMutation.mutate({ isRead: newIsRead });
  };

  const handleDownload = async () => {
    try {
      await downloadFile(
        `/api/download-issue?issueId=${issue.id}`,
        issue.title
      );
    } catch (error) {
      toast.error("Failed to download issue");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold">
              #{issue.number}
            </div>
            <div>
              <h3 className="font-medium">{issue.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={issue.isRead ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {issue.isRead ? "Read" : "Unread"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleReadStatusChange}
              disabled={updateReadStatusMutation.isPending}
            >
              {issue.isRead ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Mark Unread
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Mark Read
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleDownload}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
