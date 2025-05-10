import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileArchive, FileImage, FileText, X } from "lucide-react";
import React from "react";

export interface ComicFile {
  file: File;
  title: string;
  summary: string;
  issueNumber?: number;
}

function getFileIcon(fileName: string) {
  if (fileName.endsWith(".pdf"))
    return <FileText className="w-8 h-8 text-red-500" />;
  if (fileName.endsWith(".cbz") || fileName.endsWith(".cbr"))
    return <FileArchive className="w-8 h-8 text-yellow-500" />;
  return <FileImage className="w-8 h-8 text-muted-foreground" />;
}

interface IssueCardProps {
  index: number;
  issue?: ComicFile;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onRemove: (index: number) => void;
}

export default function IssueCard({
  index,
  issue,
  onFileChange,
  onRemove,
}: IssueCardProps) {
  return (
    <Card className="relative border-2 border-muted-foreground/10 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {issue?.file ? (
              getFileIcon(issue.file.name)
            ) : (
              <FileImage className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <Label>Issue {index + 1}</Label>
            <Input
              type="file"
              accept=".cbz,.cbr,.pdf"
              onChange={(e) => onFileChange(e, index)}
              className="mt-2"
            />
            {issue?.file && (
              <div className="mt-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">File:</span> {issue.file.name}
                </div>
                <div>
                  <span className="font-medium">Size:</span>{" "}
                  {Math.round(issue.file.size / 1024)} KB
                </div>
                {issue.issueNumber && (
                  <div>
                    <span className="font-medium">Issue #:</span>{" "}
                    {issue.issueNumber}
                  </div>
                )}
              </div>
            )}
          </div>
          {issue?.file && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => onRemove(index)}
              aria-label="Remove issue"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
