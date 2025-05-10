import {
  ComicVineResponse,
  ComicVineVolume,
} from "@/components/pages/uploadPage/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import Image from "next/image";

interface VolumeSearchProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showSearchResults: boolean;
  setShowSearchResults: (b: boolean) => void;
  handleVolumeSelect: (v: ComicVineVolume) => void;
  selectedVolume: ComicVineVolume | null;
  searchResults: ComicVineResponse | null;
  isSearching: boolean;
  searchError: string | null;
}

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
  return (
    <div className="grid gap-2">
      <Label>Search Comic Volume</Label>
      <div className="relative">
        <Input
          placeholder="Search for a comic volume..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(true);
          }}
        />
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
        {showSearchResults && searchQuery.length > 2 && (
          <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-96 overflow-auto">
            {isSearching ? (
              <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching...</span>
              </div>
            ) : searchError ? (
              <div className="p-4 text-center text-destructive">
                {searchError}
              </div>
            ) : searchResults?.results && searchResults.results.length > 0 ? (
              searchResults.results.map((result) => (
                <div
                  key={result.id}
                  className="p-2 hover:bg-accent cursor-pointer flex items-center gap-3"
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
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {result.publisher?.name}
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
    </div>
  );
}
