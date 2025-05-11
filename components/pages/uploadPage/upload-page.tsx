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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Toaster, toast } from "sonner";
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

interface ComicVineVolume {
  aliases: string | null;
  api_detail_url: string;
  character_credits: any[];
  concept_credits: any[];
  count_of_issues: number;
  date_added: string;
  date_last_updated: string;
  deck: string | null;
  description: string | null;
  first_issue: ComicVineIssue;
  id: number;
  image: ComicVineImage;
  last_issue: ComicVineIssue;
  location_credits: any[];
  name: string;
  object_credits: any[];
  person_credits: any[];
  publisher: ComicVinePublisher;
  site_detail_url: string;
  start_year: number;
  team_credits: any[];
}

interface ComicVineResponse {
  error: string;
  limit: number;
  offset: number;
  number_of_page_results: number;
  number_of_total_results: number;
  status_code: number;
  results: ComicVineVolume[];
  version: string;
}

interface ComicFile {
  file: File;
  title: string;
  summary: string;
  issueNumber?: number;
  isStored?: boolean;
  storedIssueId?: string;
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
    id: string;
    title: string;
  } | null>(null);

  const debouncedSearch = useCallback((query: string) => {
    setDebouncedSearchQuery(query);
  }, []);

  const debouncedSearchFn = useMemo(
    () => debounce(debouncedSearch, 500),
    [debouncedSearch]
  );

  // Update debounced search when searchQuery changes
  useEffect(() => {
    if (searchQuery.length > 2) {
      debouncedSearchFn(searchQuery);
    } else {
      setDebouncedSearchQuery("");
    }
  }, [searchQuery, debouncedSearchFn]);

  const { data: searchResults, isLoading: isSearching } =
    useQuery<ComicVineResponse>({
      queryKey: ["getMetadata", debouncedSearchQuery],
      queryFn: async () => {
        if (!debouncedSearchQuery) return null;
        try {
          const response = await fetch(
            `/api/volume-info?name=${debouncedSearchQuery}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch volume info");
          }
          setSearchError(null);
          return response.json();
        } catch (error) {
          setSearchError(
            error instanceof Error ? error.message : "An error occurred"
          );
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
    setIssueCount(issueCount + 1);
  };

  // Update handleVolumeSelect to handle stored issues
  const handleVolumeSelect = (volume: ComicVineVolume) => {
    console.log("Selecting volume:", volume);
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

  const handleDeleteIssue = async (issueId: string) => {
    try {
      const response = await fetch(`/api/delete-issue?issueId=${issueId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete issue");
      }

      // Remove the issue from the UI
      setUploadedIssues((prev) =>
        prev.filter((issue) => issue.storedIssueId !== issueId)
      );
      setIssueCount((count) => Math.max(1, count - 1));
      toast.success("Issue deleted successfully");
    } catch (error) {
      console.error("Error deleting issue:", error);
      toast.error(
        `Failed to delete issue: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleSubmit = async () => {
    console.log("Current selectedVolume:", selectedVolume);

    if (!selectedVolume) {
      alert("Please select a volume first");
      return;
    }

    const validIssues = uploadedIssues.filter((issue) => issue?.file);
    if (validIssues.length === 0) {
      alert("Please upload at least one issue");
      return;
    }

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
      // Redirect to the volume page
      router.push(`/comics/${selectedVolume.id}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Toaster />
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
                <Card
                  key={`issue-${index}`}
                  className="relative border-2 border-muted-foreground/10 shadow-sm"
                >
                  <CardContent className="flex flex-col gap-4 p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {uploadedIssues[index]?.file ? (
                          getFileIcon(uploadedIssues[index].file.name)
                        ) : uploadedIssues[index]?.isStored ? (
                          <FileArchive className="w-8 h-8 text-muted-foreground" />
                        ) : (
                          <FileImage className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label>Issue {index + 1}</Label>
                        {uploadedIssues[index]?.isStored ? (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {uploadedIssues[index].title}
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
                      {uploadedIssues[index]?.isStored ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setIssueToDelete({
                              id: uploadedIssues[index].storedIssueId!,
                              title: uploadedIssues[index].title,
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
                  !selectedVolume ||
                  uploadedIssues.filter((issue) => issue?.file).length === 0
                }
              >
                {!selectedVolume
                  ? "Select a Volume First"
                  : "Upload All Issues"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
