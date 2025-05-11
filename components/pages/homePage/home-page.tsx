import { PlusCircle } from "lucide-react";

import ComicFilters from "@/components/pages/homePage/comic-filters";
import ComicGrid from "@/components/pages/homePage/comic-grid";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your Comic Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your comic collection
          </p>
        </div>
        <Link href="/upload">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Upload Comic
          </Button>
        </Link>
      </div>

      <ComicFilters />
      <ComicGrid />
    </div>
  );
};
