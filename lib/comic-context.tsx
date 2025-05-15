"use client";

import type { Volume } from "@/types";
import { createContext, ReactNode, useContext, useState } from "react";

interface ComicContextType {
  volumes: Volume[];
  setVolumes: (volumes: Volume[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  readStatus: string;
  setReadStatus: (status: string) => void;
  favoriteStatus: string;
  setFavoriteStatus: (status: string) => void;
  filteredVolumes: Volume[];
}

const ComicContext = createContext<ComicContextType | undefined>(undefined);

export function ComicProvider({ children }: { children: ReactNode }) {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [readStatus, setReadStatus] = useState("all");
  const [favoriteStatus, setFavoriteStatus] = useState("all");

  const filteredVolumes = volumes
    .filter((volume) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        volume.name.toLowerCase().includes(searchLower) ||
        volume.publisher?.toLowerCase().includes(searchLower) ||
        volume.description?.toLowerCase().includes(searchLower);

      // Read status filter (if we had read status in the schema)
      const matchesReadStatus =
        readStatus === "all" ||
        (readStatus === "read" && volume.is_fully_read) ||
        (readStatus === "unread" && !volume.is_fully_read);

      // Favorite filter
      const matchesFavorite =
        favoriteStatus === "all" ||
        (favoriteStatus === "favorite" && volume.is_favorite) ||
        (favoriteStatus === "not-favorite" && !volume.is_favorite);

      return matchesSearch && matchesReadStatus && matchesFavorite;
    })
    .sort((a, b) => {
      if (sortOrder === "favorites") {
        // Sort favorites first
        return (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0);
      }
      switch (sortOrder) {
        case "newest":
          return (b.start_year || 0) - (a.start_year || 0);
        case "oldest":
          return (a.start_year || 0) - (b.start_year || 0);
        case "title-asc":
          return a.name.localeCompare(b.name);
        case "title-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  return (
    <ComicContext.Provider
      value={{
        volumes,
        setVolumes,
        searchQuery,
        setSearchQuery,
        sortOrder,
        setSortOrder,
        readStatus,
        setReadStatus,
        favoriteStatus,
        setFavoriteStatus,
        filteredVolumes,
      }}
    >
      {children}
    </ComicContext.Provider>
  );
}

export function useComics() {
  const context = useContext(ComicContext);
  if (context === undefined) {
    throw new Error("useComics must be used within a ComicProvider");
  }
  return context;
}
