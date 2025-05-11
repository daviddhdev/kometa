import { Button } from "@/components/ui/button";
import { IssueUploaderProps } from "@/types";
import { FileArchive, PlusCircle } from "lucide-react";
import IssueCard from "./issue-card";

export default function IssueUploader({
  selectedVolume,
  uploadedIssues,
  setUploadedIssues,
  handleSubmit,
  issueCount,
  setIssueCount,
}: IssueUploaderProps) {
  const addIssue = () => {
    setIssueCount(issueCount + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Issues</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addIssue}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Issue
        </Button>
      </div>

      <div className="grid gap-4">
        {Array.from({ length: issueCount }).map((_, index) => (
          <IssueCard
            key={index}
            index={index}
            uploadedIssues={uploadedIssues}
            setUploadedIssues={setUploadedIssues}
            volumeName={selectedVolume?.name || ""}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!selectedVolume || uploadedIssues.length === 0}
          className="flex items-center gap-2"
        >
          <FileArchive className="h-4 w-4" />
          Upload Issues
        </Button>
      </div>
    </div>
  );
}
