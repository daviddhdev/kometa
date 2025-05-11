"use client";
import ComicIssues from "@/components/pages/comicDetailsPage/comic-issues";
import ComicMetadata from "@/components/pages/comicDetailsPage/comic-metadata";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DownloadVolumeButton from "@/components/utils/download-volume-button";
import type { Issue, Volume } from "@/types";
import { useMutation } from "@tanstack/react-query";
import parse from "html-react-parser";
import { ArrowLeft, BookOpen, Edit, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const ComicDetailsPage = ({
  volume,
  issues: initialIssues,
}: {
  volume: Volume;
  issues: Issue[];
}) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(volume.is_favorite);
  const [issues, setIssues] = useState(initialIssues);

  // Calculate reading progress
  const totalIssues = issues.length;
  const readIssues = issues.filter((issue) => issue.is_read).length;
  const progress = (readIssues / totalIssues) * 100;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/volumes/${volume.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete volume");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Volume deleted successfully");
      router.push("/");
    },
    onError: (error) => {
      console.error("Error deleting volume:", error);
      toast.error("Failed to delete volume");
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/volumes/${volume.id}/favorite`, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Failed to toggle favorite status");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setIsFavorite(data.isFavorite);
      toast.success(
        data.isFavorite ? "Added to favorites" : "Removed from favorites"
      );
    },
    onError: (error) => {
      console.error("Error toggling favorite status:", error);
      toast.error("Failed to update favorite status");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleToggleFavorite = () => {
    favoriteMutation.mutate();
  };

  const handleReadStatusChange = (issueId: number, isRead: boolean) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue.id === issueId ? { ...issue, is_read: isRead } : issue
      )
    );
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="sticky top-6">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-lg">
              <Image
                src={volume.image || "/placeholder.svg"}
                alt={volume.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button className="w-full flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Read Now
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <DownloadVolumeButton
                  volumeId={volume.id.toString()}
                  volumeName={volume.name}
                />
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={handleToggleFavorite}
                  disabled={favoriteMutation.isPending}
                >
                  <Star
                    className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                  />
                  {isFavorite ? "Favorited" : "Mark as favorite"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex items-center gap-2"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleteMutation.isPending
                        ? "Deleting..."
                        : "Delete Volume"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Volume</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &ldquo;{volume.name}
                        &rdquo;? This action cannot be undone and will delete
                        all issues in this volume.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold tracking-tight">{volume.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-muted-foreground">{volume.publisher}</p>
            <span className="text-muted-foreground">•</span>
            <p className="text-muted-foreground">{volume.start_year}</p>
          </div>

          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Reading Progress</span>
                <span>
                  {readIssues}/{totalIssues} Issues
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                You&apos;ve read {readIssues} out of {totalIssues} issues
              </p>
            </CardContent>
          </Card>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <div className="text-muted-foreground prose prose-sm max-w-none max-h-[400px] overflow-y-auto">
              {volume.description
                ? parse(volume.description)
                : "No description available"}
            </div>
          </div>

          <Tabs defaultValue="issues" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="issues" className="mt-4">
              <ComicIssues
                key={issues.map((issue) => issue.issue_number).join(",")}
                issues={issues.map((issue) => ({
                  id: issue.id,
                  number: issue.issue_number,
                  title: issue.title || "",
                  isRead: issue.is_read || false,
                }))}
                onReadStatusChange={handleReadStatusChange}
              />
            </TabsContent>
            <TabsContent value="details" className="mt-4">
              <ComicMetadata
                metadata={{
                  publisher: volume.publisher || "Unknown",
                  startYear: volume.start_year || "Unknown",
                  totalIssues: volume.count_of_issues || "Unknown",
                  siteDetailUrl: volume.site_detail_url || "Unknown",
                  aliases: volume.aliases || "None",
                  deck: volume.deck || "No summary available",
                  dateAdded: volume.date_added || "Unknown",
                  dateLastUpdated: volume.date_last_updated || "Unknown",
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
