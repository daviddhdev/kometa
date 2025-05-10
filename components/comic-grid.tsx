"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Star, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

// Mock data for comics
const mockComics = [
  {
    id: "1",
    title: "Batman: The Dark Knight Returns",
    cover: "/placeholder.svg?height=400&width=300",
    author: "Frank Miller",
    publisher: "DC Comics",
    year: 1986,
    genre: ["Superhero", "Action"],
    totalIssues: 4,
    readIssues: 2,
    rating: 5,
    isRead: false,
  },
  {
    id: "2",
    title: "Watchmen",
    cover: "/placeholder.svg?height=400&width=300",
    author: "Alan Moore",
    publisher: "DC Comics",
    year: 1986,
    genre: ["Superhero", "Mystery"],
    totalIssues: 12,
    readIssues: 12,
    rating: 5,
    isRead: true,
  },
  {
    id: "3",
    title: "Saga",
    cover: "/placeholder.svg?height=400&width=300",
    author: "Brian K. Vaughan",
    publisher: "Image Comics",
    year: 2012,
    genre: ["Sci-Fi", "Fantasy"],
    totalIssues: 54,
    readIssues: 30,
    rating: 4,
    isRead: false,
  },
  {
    id: "4",
    title: "Maus",
    cover: "/placeholder.svg?height=400&width=300",
    author: "Art Spiegelman",
    publisher: "Pantheon Books",
    year: 1991,
    genre: ["Biography", "Historical"],
    totalIssues: 2,
    readIssues: 0,
    rating: 5,
    isRead: false,
  },
  {
    id: "5",
    title: "One Piece",
    cover: "/placeholder.svg?height=400&width=300",
    author: "Eiichiro Oda",
    publisher: "Shueisha",
    year: 1997,
    genre: ["Adventure", "Fantasy"],
    totalIssues: 100,
    readIssues: 80,
    rating: 5,
    isRead: false,
  },
  {
    id: "6",
    title: "Sandman",
    cover: "/placeholder.svg?height=400&width=300",
    author: "Neil Gaiman",
    publisher: "Vertigo",
    year: 1989,
    genre: ["Fantasy", "Horror"],
    totalIssues: 75,
    readIssues: 75,
    rating: 5,
    isRead: true,
  },
]

export default function ComicGrid() {
  const [comics, setComics] = useState(mockComics)

  const toggleReadStatus = (id: string) => {
    setComics(comics.map((comic) => (comic.id === id ? { ...comic, isRead: !comic.isRead } : comic)))
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6">
      {comics.map((comic) => (
        <Card key={comic.id} className="overflow-hidden flex flex-col h-full">
          <Link href={`/comics/${comic.id}`}>
            <div className="relative aspect-[2/3] w-full overflow-hidden">
              <Image
                src={comic.cover || "/placeholder.svg"}
                alt={comic.title}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
              {comic.isRead && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Read
                  </Badge>
                </div>
              )}
            </div>
          </Link>
          <CardContent className="p-4 flex-grow">
            <Link href={`/comics/${comic.id}`}>
              <h3 className="font-semibold text-lg line-clamp-2 hover:underline">{comic.title}</h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">{comic.author}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {comic.genre.map((g) => (
                <Badge key={g} variant="outline" className="text-xs">
                  {g}
                </Badge>
              ))}
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Reading Progress</span>
                <span>
                  {comic.readIssues}/{comic.totalIssues}
                </span>
              </div>
              <Progress value={(comic.readIssues / comic.totalIssues) * 100} className="h-2" />
            </div>
            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < comic.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                />
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => toggleReadStatus(comic.id)}
            >
              <Eye className="h-3.5 w-3.5" />
              {comic.isRead ? "Unread" : "Read"}
            </Button>
            <Link href={`/comics/${comic.id}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                View
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
