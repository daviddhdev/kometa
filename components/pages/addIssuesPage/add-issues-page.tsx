"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingPlaceholder } from "@/components/ui/loading-placeholder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComicFile } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  FileArchive,
  FileImage,
  FileText,
  PlusCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function getFileIcon(fileName: string) {
  if (fileName.endsWith(".pdf"))
    return <FileText className="w-8 h-8 text-red-500" />;
  if (fileName.endsWith(".cbz") || fileName.endsWith(".cbr"))
    return <FileArchive className="w-8 h-8 text-yellow-500" />;
  return <FileImage className="w-8 h-8 text-muted-foreground" />;
}

interface VolumeData {
  volume: {
    id: string;
    title: string;
    publisher: string;
    year: number;
  };
  issues: Array<{
    id: string;
    issue_number: number;
    title: string;
    cover_date: string;
  }>;
}

export default function AddIssuesPage({ volumeId }: { volumeId: string }) {
  const router = useRouter();
  const [uploadedIssues, setUploadedIssues] = useState<ComicFile[]>([]);
  const [issueToDelete, setIssueToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [isUpdatingIssue, setIsUpdatingIssue] = useState(false);

  // Fetch volume details and issues
  const { data: volumeData, isLoading } = useQuery<VolumeData>({
    queryKey: ["getVolume", volumeId],
    queryFn: async () => {
      const response = await fetch(`/api/volumes/${volumeId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch volume");
      }
      return response.json();
    },
  });

  // Update useEffect to handle stored issues
  useEffect(() => {
    if (volumeData?.issues && volumeData.issues.length > 0) {
      // Create ComicFile objects for stored issues
      const existingIssues = volumeData.issues.map((issue: any) => ({
        title: issue.title || `Issue ${issue.issue_number}`,
        summary: issue.summary || "",
        issueNumber: issue.issue_number,
        isStored: true,
        storedIssueId: issue.id,
      }));

      setUploadedIssues(existingIssues);
    }
  }, [volumeData?.issues]);

  const addIssue = () => {
    setUploadedIssues((prev) => [
      ...prev,
      {
        title: "",
        summary: "",
        isStored: false,
      },
    ]);
  };

  const handleIssueUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
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

  const removeIssue = (index: number) => {
    setUploadedIssues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteIssue = async (issueId: number) => {
    try {
      const response = await fetch(`/api/delete-issue?issueId=${issueId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete issue");
      }

      // Remove the issue from the uploaded issues array
      setUploadedIssues((prev) =>
        prev.filter(
          (issue) =>
            issue.storedIssueId === undefined || issue.storedIssueId !== issueId
        )
      );

      toast.success("Issue deleted successfully");
    } catch (error) {
      console.error("Error deleting issue:", error);
      toast.error("Failed to delete issue");
    }
  };

  const handleSubmit = async () => {
    if (!volumeData?.volume) {
      toast.error("Volume not found");
      return;
    }

    const validIssues = uploadedIssues.filter((issue) => issue?.file);
    if (validIssues.length === 0) {
      toast.error("Please upload at least one issue");
      return;
    }

    let hasError = false;

    // Create FormData for each issue
    for (let i = 0; i < uploadedIssues.length; i++) {
      const issue = uploadedIssues[i];
      if (!issue?.file) continue;

      const formData = new FormData();
      formData.append("file", issue.file);
      formData.append("volumeId", volumeId);
      formData.append("issueNumber", (issue.issueNumber || i + 1).toString());
      formData.append("title", issue.title);
      formData.append("summary", issue.summary);
      formData.append(
        "metadata",
        JSON.stringify({
          volume: {
            id: volumeData.volume.id,
            name: volumeData.volume.title,
            publisher: volumeData.volume.publisher,
            start_year: volumeData.volume.year,
            count_of_issues: volumeData.issues.length,
            description: "",
            image: "",
            site_detail_url: "",
            aliases: [],
            deck: "",
            date_added: "",
            date_last_updated: "",
          },
        })
      );

      try {
        const response = await fetch("/api/upload-issue", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(
            `Failed to upload issue ${i + 1}: ${
              errorData.error || "Failed to upload issue"
            }`
          );
          hasError = true;
          throw new Error(errorData.error || "Failed to upload issue");
        }
        toast.success(`Issue ${i + 1} uploaded successfully!`);
      } catch (error) {
        console.error(`Error uploading issue ${i + 1}:`, error);
        toast.error(
          `Failed to upload issue ${i + 1}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        hasError = true;
      }
    }

    if (!hasError) {
      // Redirect back to the volume page
      router.push(`/comics/${volumeId}`);
    }
  };

  const handleIssueNumberChange = async (
    issueId: number,
    newIssueNumber: number
  ) => {
    setIsUpdatingIssue(true);
    try {
      const response = await fetch(`/api/update-issue`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issueId,
          issueNumber: newIssueNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update issue number");
      }

      // Update local state
      setUploadedIssues((prev) =>
        prev.map((issue) =>
          issue.storedIssueId === issueId
            ? { ...issue, issueNumber: newIssueNumber }
            : issue
        )
      );

      toast.success("Issue number updated successfully");
    } catch (error) {
      console.error("Error updating issue number:", error);
      toast.error("Failed to update issue number");
    } finally {
      setIsUpdatingIssue(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex h-32 items-center justify-center">
          <LoadingPlaceholder text="Loading volume details..." />
        </div>
      </div>
    );
  }

  if (!volumeData?.volume) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex h-32 items-center justify-center">
          <LoadingPlaceholder text="Loading volume details..." />
        </div>
      </div>
    );
  }

  const volume = volumeData.volume;

  return (
    <div className="container mx-auto px-4 py-6">
      <Link
        href={`/comics/${volumeId}`}
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Volume
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Add Issues to {volume.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload new issues to this volume
          </p>
        </div>
      </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {uploadedIssues.map((issue, index) => (
            <Card
              key={`issue-${issue.storedIssueId || index}`}
              className="relative border-2 border-muted-foreground/10 shadow-sm"
            >
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {issue.file ? (
                      getFileIcon(issue.file.name)
                    ) : issue.isStored ? (
                      <FileArchive className="w-8 h-8 text-muted-foreground" />
                    ) : (
                      <FileImage className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label>Issue</Label>
                      <Select
                        value={issue.issueNumber?.toString()}
                        onValueChange={(value) => {
                          if (issue.isStored) {
                            handleIssueNumberChange(
                              issue.storedIssueId!,
                              parseInt(value)
                            );
                          } else {
                            setUploadedIssues((prev) =>
                              prev.map((iss, idx) =>
                                idx === index
                                  ? { ...iss, issueNumber: parseInt(value) }
                                  : iss
                              )
                            );
                          }
                        }}
                        disabled={isUpdatingIssue && issue.isStored}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(volumeData.issues.length)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {issue.isStored ? (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {issue.title}
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept=".cbz,.cbr,.pdf"
                        onChange={(e) => handleIssueUpload(e, index)}
                        className="mt-2"
                      />
                    )}
                  </div>
                  {issue.isStored ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setIssueToDelete({
                          id: issue.storedIssueId!,
                          title: issue.title,
                        })
                      }
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIssue(index)}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSubmit}
            disabled={
              uploadedIssues.filter((issue) => issue?.file).length === 0
            }
          >
            Upload All Issues
          </Button>
        </div>
      </div>

      <AlertDialog
        open={!!issueToDelete}
        onOpenChange={() => setIssueToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Issue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {issueToDelete?.title}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (issueToDelete) {
                  handleDeleteIssue(issueToDelete.id);
                  setIssueToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
