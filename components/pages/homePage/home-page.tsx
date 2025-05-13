import ComicFilters from "@/components/pages/homePage/comic-filters";
import ComicGrid from "@/components/pages/homePage/comic-grid";

export const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <ComicFilters />
      <ComicGrid />
    </div>
  );
};
