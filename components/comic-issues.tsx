"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { downloadFile } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Issue {
  id: string;
  number: number;
  title: string;
  isRead: boolean;
}

interface ComicIssuesProps {
  issues: Issue[];
  comicId: string;
}

export default function ComicIssues({
  issues: initialIssues,
  comicId,
}: ComicIssuesProps) {
  const router = useRouter();

  const { data: issues = initialIssues } = useQuery({
    queryKey: ["volumeIssues", comicId],
    queryFn: async () => {
      const response = await fetch(`/api/volume-issues?volumeId=${comicId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch issues");
      }
      const data = await response.json();
      return data.map(
        (issue: {
          id: string;
          issue_number: number;
          title: string;
          is_read: boolean;
        }) => ({
          id: issue.id,
          number: issue.issue_number,
          title: issue.title,
          isRead: issue.is_read,
        })
      );
    },
    initialData: initialIssues,
  });

  const toggleReadStatus = async (issueId: string) => {
    try {
      const response = await fetch(
        `/api/toggle-read-status?issueId=${issueId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle read status");
      }

      // Invalidate the query to refetch the data
      router.refresh();
    } catch (error) {
      toast.error("Failed to update read status");
    }
  };

  const handleDownload = async (issueId: string, issueTitle: string) => {
    try {
      await downloadFile(`/api/download-issue?issueId=${issueId}`, issueTitle);
    } catch (error) {
      toast.error("Failed to download issue");
    }
  };

  return (
    <div className="space-y-4">
      {issues.map((issue: Issue) => (
        <Card key={issue.id} className="overflow-hidden">
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
                  onClick={() => toggleReadStatus(issue.id)}
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
                  onClick={() => handleDownload(issue.id, issue.title)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
