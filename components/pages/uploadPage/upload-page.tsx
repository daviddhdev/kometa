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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isRateLimitError } from "@/lib/comicvine-utils";
import { ComicFile, ComicVineResponse, ComicVineVolume } from "@/types";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash/debounce";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import VolumeInfoCard from "./volume-info-card";
import VolumeSearch from "./volume-search";

interface ComicVineImage {
  icon_url: string;
  medium_url: string;
  screen_url: string;
  screen_large_url: string;
  small_url: string;
  super_url: string;
  thumb_url: string;
  tiny_url: string;
  original_url: string;
  image_tags: string;
}

interface ComicVinePublisher {
  api_detail_url: string;
  id: number;
  name: string;
  site_detail_url: string;
}

interface ComicVineIssue {
  api_detail_url: string;
  id: number;
  name: string;
  site_detail_url: string;
}

function getFileIcon(fileName: string) {
  if (fileName.endsWith(".pdf"))
    return <FileText className="w-8 h-8 text-red-500" />;
  if (fileName.endsWith(".cbz") || fileName.endsWith(".cbr"))
    return <FileArchive className="w-8 h-8 text-yellow-500" />;
  return <FileImage className="w-8 h-8 text-muted-foreground" />;
}

export default function UploadPage() {
  const router = useRouter();
  const [issueCount, setIssueCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedVolume, setSelectedVolume] = useState<ComicVineVolume | null>(
    null
  );
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [uploadedIssues, setUploadedIssues] = useState<ComicFile[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [issueToDelete, setIssueToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [isUpdatingIssue, setIsUpdatingIssue] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const debouncedSearch = useCallback((query: string) => {
    setDebouncedSearchQuery(query);
  }, []);

  const debouncedSearchFn = useMemo(
    () => debounce(debouncedSearch, 500),
    [debouncedSearch]
  );

  // Update debounced search when searchQuery changes
  useEffect(() => {
    if (searchQuery.length > 2 && !selectedVolume) {
      debouncedSearchFn(searchQuery);
      setShowSearchResults(true);
    } else {
      setDebouncedSearchQuery("");
      setShowSearchResults(false);
    }
  }, [searchQuery, debouncedSearchFn, selectedVolume]);

  // Add effect to hide search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".volume-search")) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: searchResults, isLoading: isSearching } =
    useQuery<ComicVineResponse>({
      queryKey: ["getMetadata", debouncedSearchQuery],
      queryFn: async () => {
        if (!debouncedSearchQuery) return null;
        try {
          const response = await fetch(
            `/api/volume-info?name=${debouncedSearchQuery}`
          );
          const data = await response.json();

          if (isRateLimitError(data)) {
            setSearchError(data.message);
            throw new Error(data.message);
          }

          if (!response.ok) {
            throw new Error("Failed to fetch volume info");
          }

          setSearchError(null);
          return data;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "An error occurred";
          setSearchError(errorMessage);
          throw error;
        }
      },
      enabled: debouncedSearchQuery.length > 2,
    });

  // Add query for stored issues
  const { data: storedIssues } = useQuery({
    queryKey: ["getStoredIssues", selectedVolume?.id],
    queryFn: async () => {
      if (!selectedVolume?.id) return null;
      const response = await fetch(
        `/api/volume-issues?volumeId=${selectedVolume.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch stored issues");
      }
      return response.json();
    },
    enabled: !!selectedVolume?.id,
  });

  useEffect(() => {
    if (selectedVolume) {
      setIssueCount(selectedVolume.count_of_issues || 1);
    }
  }, [selectedVolume]);

  // Update useEffect to handle stored issues
  useEffect(() => {
    if (storedIssues && storedIssues.length > 0) {
      // Set issue count to the number of stored issues
      setIssueCount(storedIssues.length);

      // Create ComicFile objects for stored issues
      const existingIssues = storedIssues.map((issue: any) => ({
        title: issue.title || `Issue ${issue.issue_number}`,
        summary: issue.summary || "",
        issueNumber: issue.issue_number,
        isStored: true,
        storedIssueId: issue.id,
      }));

      setUploadedIssues(existingIssues);
    }
  }, [storedIssues]);

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

  // Update handleVolumeSelect to handle stored issues
  const handleVolumeSelect = (volume: ComicVineVolume) => {
    setSelectedVolume(volume);
    setShowSearchResults(false);
    setSearchQuery(volume.name);

    // Reset uploaded issues when selecting a new volume
    setUploadedIssues([]);
    setIssueCount(1);
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
    setIssueCount((count) => Math.max(1, count - 1));
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
    if (!selectedVolume) {
      alert("Please select a volume first");
      return;
    }

    const validIssues = uploadedIssues.filter((issue) => issue?.file);
    if (validIssues.length === 0) {
      alert("Please upload at least one issue");
      return;
    }

    setIsUploading(true);
    let hasError = false;

    // Create FormData for each issue
    for (let i = 0; i < uploadedIssues.length; i++) {
      const issue = uploadedIssues[i];
      if (!issue?.file) continue;

      const formData = new FormData();
      formData.append("file", issue.file);
      formData.append("volumeId", selectedVolume.id.toString());
      formData.append("issueNumber", (issue.issueNumber || i + 1).toString());
      formData.append("title", issue.title);
      formData.append("summary", issue.summary);
      formData.append(
        "metadata",
        JSON.stringify({
          volume: {
            id: selectedVolume.id,
            name: selectedVolume.name,
            publisher: selectedVolume.publisher?.name,
            start_year: selectedVolume.start_year,
            count_of_issues: selectedVolume.count_of_issues,
            description: selectedVolume.description,
            image: selectedVolume.image?.original_url,
            site_detail_url: selectedVolume.site_detail_url,
            aliases: selectedVolume.aliases,
            deck: selectedVolume.deck,
            date_added: selectedVolume.date_added,
            date_last_updated: selectedVolume.date_last_updated,
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

    setIsUploading(false);
    if (!hasError) {
      // Redirect to the volume page
      router.push(`/comics/${selectedVolume.id}`);
    }
  };

  const handleIssueNumberChange = async (
    issueId: number,
    newIssueNumber: number
  ) => {
    if (!selectedVolume) return;

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

  return (
    <div className="container mx-auto px-4 py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Library
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Comic</h1>
          <p className="text-muted-foreground mt-1">
            Add a new comic to your library
          </p>
        </div>
      </div>

      {isUploading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <LoadingPlaceholder text="Uploading issues..." />
        </div>
      ) : (
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="flex flex-col gap-8">
              <VolumeSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showSearchResults={showSearchResults}
                setShowSearchResults={setShowSearchResults}
                handleVolumeSelect={handleVolumeSelect}
                selectedVolume={selectedVolume}
                searchResults={searchResults ?? null}
                isSearching={isSearching}
                searchError={searchError}
              />
              <VolumeInfoCard selectedVolume={selectedVolume} />
            </div>
          </TabsContent>

          <TabsContent value="issues">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Comic Issues</h2>
                <Button
                  variant="default"
                  onClick={addIssue}
                  className="flex items-center gap-2"
                  disabled={isUpdatingIssue}
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
                                        ? {
                                            ...iss,
                                            issueNumber: parseInt(value),
                                          }
                                        : iss
                                    )
                                  );
                                }
                              }}
                              disabled={isUpdatingIssue}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(issueCount)].map((_, i) => (
                                  <SelectItem
                                    key={i + 1}
                                    value={(i + 1).toString()}
                                  >
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
                              disabled={isUpdatingIssue}
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
                            disabled={isUpdatingIssue}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeIssue(index)}
                            className="absolute top-2 right-2"
                            disabled={isUpdatingIssue}
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
                    uploadedIssues.filter((issue) => issue?.file).length ===
                      0 || isUpdatingIssue
                  }
                >
                  Upload All Issues
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

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
