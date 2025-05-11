import { Button } from "@/components/ui/button";
import { FileArchive, PlusCircle } from "lucide-react";
import React from "react";
import IssueCard, { ComicFile } from "./issue-card";
import { ComicVineVolume } from "./types";

interface IssueUploaderProps {
  selectedVolume: ComicVineVolume | null;
  uploadedIssues: ComicFile[];
  setUploadedIssues: React.Dispatch<React.SetStateAction<ComicFile[]>>;
  handleSubmit: () => void;
  issueCount: number;
  setIssueCount: React.Dispatch<React.SetStateAction<number>>;
}

export default function IssueUploader({
  selectedVolume,
  uploadedIssues,
  setUploadedIssues,
  handleSubmit,
  issueCount,
  setIssueCount,
}: IssueUploaderProps) {
  const addIssue = () => {
    setIssueCount((count) => count + 1);
  };

  const removeIssue = (index: number) => {
    setUploadedIssues((prev) => prev.filter((_, i) => i !== index));
    setIssueCount((count) => Math.max(1, count - 1));
  };

  const handleIssueUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validFormats = [".cbz", ".cbr", ".pdf"];
    const fileExtension = file.name
      .toLowerCase()
      .slice(file.name.lastIndexOf("."));
    if (!validFormats.includes(fileExtension)) {
      alert("Please upload a valid comic file (.cbz, .cbr, or .pdf)");
      return;
    }
    const newIssue: ComicFile = {
      file,
      title: file.name,
      summary: "",
    };
    const issueMatch = file.name.match(/(?:issue|#)?\s*(\d+)/i);
    if (issueMatch) {
      newIssue.issueNumber = parseInt(issueMatch[1]);
    }
    setUploadedIssues((prev) => {
      const newIssues = [...prev];
      newIssues[index] = newIssue;
      return newIssues;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Comic Issues</h2>
        <Button
          variant="default"
          onClick={addIssue}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          Add Issue
        </Button>
      </div>
      {issueCount === 0 || uploadedIssues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileArchive className="w-12 h-12 mb-2" />
          <div>
            No issues uploaded yet. Click &quot;Add Issue&quot; to begin.
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(issueCount)].map((_, index) => (
          <IssueCard
            key={`issue-${index}`}
            index={index}
            issue={uploadedIssues[index]}
            onFileChange={handleIssueUpload}
            onRemove={removeIssue}
          />
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSubmit}
          disabled={
            !selectedVolume ||
            uploadedIssues.filter((issue) => issue?.file).length === 0
          }
        >
          {!selectedVolume ? "Select a Volume First" : "Upload All Issues"}
        </Button>
      </div>
    </div>
  );
}
