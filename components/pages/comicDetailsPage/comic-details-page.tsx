import ComicIssues from "@/components/comic-issues";
import ComicMetadata from "@/components/comic-metadata";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import parse from "html-react-parser";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Download,
  Edit,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const ComicDetailsPage = async ({
  volume,
  issues,
}: {
  volume: any;
  issues: any;
}) => {
  // Calculate reading progress
  const totalIssues = issues.length;
  const readIssues = issues.filter((issue: any) => issue.is_read).length;
  const progress = (readIssues / totalIssues) * 100;

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
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Bookmark
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
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
            <div className="text-muted-foreground prose prose-sm max-w-none">
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
                issues={issues.map((issue: any) => ({
                  id: issue.id,
                  number: issue.issue_number,
                  title: issue.title,
                  isRead: issue.is_read,
                }))}
                comicId={volume.id}
              />
            </TabsContent>
            <TabsContent value="details" className="mt-4">
              <ComicMetadata
                metadata={{
                  format: "Comic Book",
                  language: "English",
                  pages: 0,
                  ageRating: "Not Rated",
                  colorist: "Unknown",
                  letterer: "Unknown",
                  editor: "Unknown",
                  releaseDate: volume.start_year?.toString() || "Unknown",
                  isbn: "Unknown",
                  publisher: volume.publisher,
                  startYear: volume.start_year,
                  totalIssues: volume.count_of_issues,
                  siteDetailUrl: volume.site_detail_url,
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
