"use client";

import type { Issue } from "@/types";
import { IssueCard } from "./issue-card";

interface ComicIssuesProps {
  issues: Issue[];
  onReadStatusChange?: (issueId: number, isRead: boolean) => void;
}

export default function ComicIssues({
  issues,
  onReadStatusChange,
}: ComicIssuesProps) {
  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          onReadStatusChange={onReadStatusChange}
        />
      ))}
    </div>
  );
}
