"use client";

import ComicFilters from "@/components/pages/homePage/comic-filters";
import ComicGrid from "@/components/pages/homePage/comic-grid";

export function HomePage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Comic Reader</h1>
      <ComicFilters />
      <ComicGrid />
    </div>
  );
}
