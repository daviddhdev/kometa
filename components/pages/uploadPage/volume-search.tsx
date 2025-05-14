import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VolumeSearchProps } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckCircle2, Loader2, Search } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

export default function VolumeSearch({
  searchQuery,
  setSearchQuery,
  showSearchResults,
  setShowSearchResults,
  handleVolumeSelect,
  selectedVolume,
  searchResults,
  isSearching,
  searchError,
  sortOrder,
  setSortOrder,
}: VolumeSearchProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Query to check if volumes exist in database
  const { data: existingVolumes } = useQuery({
    queryKey: [
      "checkExistingVolumes",
      searchResults?.results?.map((v) => v.id),
    ],
    queryFn: async () => {
      if (!searchResults?.results?.length) return {};

      const volumeChecks = await Promise.all(
        searchResults.results.map(async (volume) => {
          const response = await fetch(
            `/api/volume-exists?volumeId=${volume.id}`
          );
          if (!response.ok) return { [volume.id]: false };
          const data = await response.json();
          return { [volume.id]: data.exists };
        })
      );

      return volumeChecks.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    },
    enabled: !!searchResults?.results?.length,
  });

  const rowVirtualizer = useVirtualizer({
    count: searchResults?.results?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height of each row
    overscan: 5, // Number of items to render outside of the visible area
  });

  // Sort the results based on the selected sort order
  const sortedResults = searchResults?.results?.slice().sort((a, b) => {
    switch (sortOrder) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "date-asc":
        return (a.start_year || 0) - (b.start_year || 0);
      case "date-desc":
        return (b.start_year || 0) - (a.start_year || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4 volume-search">
      <div className="space-y-2">
        <Label>Search for a Volume</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a volume..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="date-asc">Year (Oldest)</SelectItem>
              <SelectItem value="date-desc">Year (Newest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {showSearchResults && (
        <div
          className="border rounded-md divide-y max-h-[400px] overflow-y-auto"
          ref={parentRef}
        >
          {isSearching ? (
            <div className="p-4 text-center">
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              <span className="text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          ) : searchError ? (
            <div className="p-4 text-center text-destructive">
              {searchError}
            </div>
          ) : sortedResults && sortedResults.length > 0 ? (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const result = sortedResults[virtualRow.index];
                return (
                  <div
                    key={result.id}
                    className={`p-2 hover:bg-accent cursor-pointer flex items-center gap-3 ${
                      existingVolumes?.[result.id] ? "bg-muted/50" : ""
                    }`}
                    onClick={() => handleVolumeSelect(result)}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="relative w-12 h-16 flex-shrink-0">
                      <Image
                        src={result.image?.original_url || "/placeholder.svg"}
                        alt={result.name}
                        fill
                        sizes="(max-width: 768px) 48px, 48px"
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium flex items-center gap-2">
                        {result.name}
                        {existingVolumes?.[result.id] && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.publisher?.name}
                        {typeof result.count_of_issues === "number" && (
                          <>
                            {" "}
                            &middot; {result.count_of_issues} issue
                            {result.count_of_issues !== 1 ? "s" : ""}
                          </>
                        )}
                        <> &middot; {result.start_year}</>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
