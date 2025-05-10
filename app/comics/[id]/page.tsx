import ComicIssues from "@/components/comic-issues";
import ComicMetadata from "@/components/comic-metadata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Download,
  Edit,
  Share2,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function ComicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // In a real app, you would fetch the comic data based on the ID
  const { id } = await params;
  const comic = {
    id: id,
    title: "Batman: The Dark Knight Returns",
    cover: "/placeholder.svg?height=600&width=400",
    author: "Frank Miller",
    publisher: "DC Comics",
    year: 1986,
    genre: ["Superhero", "Action", "Crime", "Drama"],
    description:
      "The Dark Knight Returns is a 1986 four-issue comic book miniseries starring Batman, written by Frank Miller, illustrated by Miller and Klaus Janson, and published by DC Comics. It tells the story of Bruce Wayne, who at 55 years old returns from retirement to fight crime and faces opposition from the Gotham City police force and the United States government.",
    totalIssues: 4,
    readIssues: 2,
    rating: 5,
    isRead: false,
    issues: [
      { number: 1, title: "The Dark Knight Returns", isRead: true },
      { number: 2, title: "The Dark Knight Triumphant", isRead: true },
      { number: 3, title: "Hunt the Dark Knight", isRead: false },
      { number: 4, title: "The Dark Knight Falls", isRead: false },
    ],
    metadata: {
      format: "Limited Series",
      language: "English",
      pages: 196,
      ageRating: "Teen",
      colorist: "Lynn Varley",
      letterer: "John Costanza",
      editor: "Dick Giordano",
      releaseDate: "February 1986",
      isbn: "978-1563893421",
    },
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
                src={comic.cover || "/placeholder.svg"}
                alt={comic.title}
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
          <h1 className="text-3xl font-bold tracking-tight">{comic.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-muted-foreground">By {comic.author}</p>
            <span className="text-muted-foreground">•</span>
            <p className="text-muted-foreground">
              {comic.publisher}, {comic.year}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {comic.genre.map((g) => (
              <Badge key={g} variant="secondary">
                {g}
              </Badge>
            ))}
          </div>

          <div className="flex items-center mt-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < comic.rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              5.0 (Your Rating)
            </span>
          </div>

          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Reading Progress</span>
                <span>
                  {comic.readIssues}/{comic.totalIssues} Issues
                </span>
              </div>
              <Progress
                value={(comic.readIssues / comic.totalIssues) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                You&apos;ve read {comic.readIssues} out of {comic.totalIssues}{" "}
                issues
              </p>
            </CardContent>
          </Card>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{comic.description}</p>
          </div>

          <Tabs defaultValue="issues" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="issues" className="mt-4">
              <ComicIssues issues={comic.issues} comicId={comic.id} />
            </TabsContent>
            <TabsContent value="details" className="mt-4">
              <ComicMetadata metadata={comic.metadata} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
