import { Input } from "@/components/ui/input";
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
import { FileImage, Loader2 } from "lucide-react";
import { useRef } from "react";

const PUBLISHERS = [
  "DC Comics",
  "Marvel Comics",
  "Image Comics",
  "Dark Horse Comics",
  "IDW Publishing",
  "Boom! Studios",
  "Valiant Comics",
  "Dynamite Entertainment",
  "Oni Press",
  "Archie Comics",
  "Other",
] as const;

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
  searchYear,
  setSearchYear,
  searchPublisher,
  setSearchPublisher,
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
    <div className="volume-search relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for a comic volume..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-8"
          />
          {isSearching && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <Select value={searchYear} onValueChange={setSearchYear}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any year</SelectItem>
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select value={searchPublisher} onValueChange={setSearchPublisher}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any publisher" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any publisher</SelectItem>
            {PUBLISHERS.map((publisher) => (
              <SelectItem key={publisher} value={publisher}>
                {publisher}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showSearchResults && searchQuery.length > 2 && (
        <div className="absolute z-50 w-full mt-2 bg-background border rounded-md shadow-lg">
          {searchError ? (
            <div className="p-4 text-destructive">{searchError}</div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {searchResults?.results.length === 0 ? (
                <div className="p-4 text-muted-foreground">
                  No results found
                </div>
              ) : (
                searchResults?.results.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    onClick={() => handleVolumeSelect(result)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0">
                        {result.image?.thumb_url ? (
                          <img
                            src={result.image.thumb_url}
                            alt={result.name}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.classList.add(
                                  "bg-muted",
                                  "flex",
                                  "items-center",
                                  "justify-center"
                                );
                                parent.innerHTML =
                                  '<svg class="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                            <FileImage className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.publisher?.name || "Unknown Publisher"} •{" "}
                          {result.count_of_issues || 0} issues
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Added:{" "}
                          {new Date(result.date_added).toLocaleDateString()} •{" "}
                          Updated:{" "}
                          {new Date(
                            result.date_last_updated
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
