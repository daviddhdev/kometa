"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, SortAsc, SortDesc } from "lucide-react"

export default function ComicFilters() {
  const [sortOrder, setSortOrder] = useState("newest")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [readStatus, setReadStatus] = useState("all")

  const genres = [
    "Action",
    "Adventure",
    "Biography",
    "Comedy",
    "Crime",
    "Fantasy",
    "Historical",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Superhero",
    "Thriller",
    "Western",
  ]

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre))
    } else {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  return (
    <div className="bg-muted/40 p-4 rounded-lg mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search comics by title, author, publisher..." className="pl-9" />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[140px] bg-background">
              <div className="flex items-center gap-2">
                {sortOrder === "newest" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-background flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Genres {selectedGenres.length > 0 && `(${selectedGenres.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {genres.map((genre) => (
                <DropdownMenuCheckboxItem
                  key={genre}
                  checked={selectedGenres.includes(genre)}
                  onCheckedChange={() => toggleGenre(genre)}
                >
                  {genre}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={readStatus} onValueChange={setReadStatus}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Read Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Comics</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedGenres.map((genre) => (
            <Badge key={genre} variant="secondary" className="px-2 py-1">
              {genre}
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => toggleGenre(genre)}>
                ×
              </Button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => setSelectedGenres([])}>
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}

import { Badge } from "@/components/ui/badge"
