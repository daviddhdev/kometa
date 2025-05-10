"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface Comic {
  id: number;
  name: string;
  publisher: string | null;
  start_year: number | null;
  count_of_issues: number | null;
  description: string | null;
  image: string | null;
  site_detail_url: string | null;
}

interface ComicContextType {
  comics: Comic[];
  setComics: (comics: Comic[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  readStatus: string;
  setReadStatus: (status: string) => void;
  filteredComics: Comic[];
}

const ComicContext = createContext<ComicContextType | undefined>(undefined);

export function ComicProvider({ children }: { children: ReactNode }) {
  const [comics, setComics] = useState<Comic[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [readStatus, setReadStatus] = useState("all");

  const filteredComics = comics
    .filter((comic) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        comic.name.toLowerCase().includes(searchLower) ||
        comic.publisher?.toLowerCase().includes(searchLower) ||
        comic.description?.toLowerCase().includes(searchLower);

      // Read status filter (if we had read status in the schema)
      const matchesReadStatus = readStatus === "all" || true; // TODO: Implement read status filtering when we add it to the schema

      return matchesSearch && matchesReadStatus;
    })
    .sort((a, b) => {
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
        comics,
        setComics,
        searchQuery,
        setSearchQuery,
        sortOrder,
        setSortOrder,
        readStatus,
        setReadStatus,
        filteredComics,
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
