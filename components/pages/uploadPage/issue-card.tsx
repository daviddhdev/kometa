import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComicFile } from "@/types";
import { FileArchive, FileImage, FileText, X } from "lucide-react";
import React from "react";

function getFileIcon(fileName: string) {
  if (fileName.endsWith(".pdf"))
    return <FileText className="w-8 h-8 text-red-500" />;
  if (fileName.endsWith(".cbz") || fileName.endsWith(".cbr"))
    return <FileArchive className="w-8 h-8 text-yellow-500" />;
  return <FileImage className="w-8 h-8 text-muted-foreground" />;
}

interface IssueCardProps {
  index: number;
  uploadedIssues: ComicFile[];
  setUploadedIssues: React.Dispatch<React.SetStateAction<ComicFile[]>>;
  volumeName: string;
}

export default function IssueCard({
  index,
  uploadedIssues,
  setUploadedIssues,
  volumeName,
}: IssueCardProps) {
  const issue = uploadedIssues[index];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is a comic format
    const validFormats = [".cbz", ".cbr", ".pdf"];
    const fileExtension = file.name
      .toLowerCase()
      .slice(file.name.lastIndexOf("."));
    if (!validFormats.includes(fileExtension)) {
      alert("Please upload a valid comic file (.cbz, .cbr, or .pdf)");
      return;
    }

    // Create a new issue object
    const newIssue: ComicFile = {
      file,
      title: file.name,
      summary: "",
    };

    // Try to extract issue number from filename
    const issueMatch = file.name.match(/(?:issue|#)?\s*(\d+)/i);
    if (issueMatch) {
      newIssue.issueNumber = parseInt(issueMatch[1]);
    }

    // Update the uploaded issues array
    setUploadedIssues((prev) => {
      const newIssues = [...prev];
      newIssues[index] = newIssue;
      return newIssues;
    });
  };

  const handleRemove = () => {
    setUploadedIssues((prev) => prev.filter((_, i) => i !== index));
  };

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
              onChange={handleFileChange}
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
              onClick={handleRemove}
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
