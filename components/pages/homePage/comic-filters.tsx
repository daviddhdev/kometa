"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useComics } from "@/lib/comic-context";
import { Search, SortAsc, SortDesc, Star } from "lucide-react";

export default function ComicFilters() {
  const {
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    readStatus,
    setReadStatus,
    favoriteStatus,
    setFavoriteStatus,
  } = useComics();

  return (
    <div className="bg-muted/40 p-4 rounded-lg mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search comics by title, author, publisher..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px] bg-background">
              <div className="flex items-center gap-2">
                {sortOrder === "newest" ? (
                  <SortDesc className="h-4 w-4" />
                ) : sortOrder === "favorites" ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ) : (
                  <SortAsc className="h-4 w-4" />
                )}
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              <SelectItem value="favorites">Favorites First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={favoriteStatus} onValueChange={setFavoriteStatus}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Favorites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="favorite">Only Favorites</SelectItem>
              <SelectItem value="not-favorite">Only Non-Favorites</SelectItem>
            </SelectContent>
          </Select>

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
    </div>
  );
}
