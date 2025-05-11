"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

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

export default function ComicIssues({ issues, comicId }: ComicIssuesProps) {
  const [comicIssues, setComicIssues] = useState(issues);

  const toggleReadStatus = (issueId: string) => {
    setComicIssues(
      comicIssues.map((issue) =>
        issue.id === issueId ? { ...issue, isRead: !issue.isRead } : issue
      )
    );
  };

  return (
    <div className="space-y-4">
      {comicIssues.map((issue) => (
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
