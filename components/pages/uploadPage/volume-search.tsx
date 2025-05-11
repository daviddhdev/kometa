import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VolumeSearchProps } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Search } from "lucide-react";
import Image from "next/image";

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
}: VolumeSearchProps) {
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

  return (
    <div className="space-y-4 volume-search">
      <div className="space-y-2">
        <Label>Search for a Volume</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a volume..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {showSearchResults && (
        <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
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
          ) : searchResults?.results && searchResults.results.length > 0 ? (
            searchResults.results.map((result) => (
              <div
                key={result.id}
                className={`p-2 hover:bg-accent cursor-pointer flex items-center gap-3 ${
                  existingVolumes?.[result.id] ? "bg-muted/50" : ""
                }`}
                onClick={() => handleVolumeSelect(result)}
              >
                <div className="relative w-12 h-16 flex-shrink-0">
                  <Image
                    src={result.image?.original_url || "/placeholder.svg"}
                    alt={result.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
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
            ))
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
