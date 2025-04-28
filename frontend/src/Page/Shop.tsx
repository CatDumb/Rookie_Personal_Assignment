import { ShopHeader } from "@/components/Header/ShopHeader";
import { BookFilters } from "@/components/ui/filter";
import { useState } from "react";

// Import the FilterState interface to properly type the filters
interface FilterState {
  categories: number[];
  authors: number[];
  ratings: number[];
}

const ShopPage = () => {
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    categories: [],
    authors: [],
    ratings: []
  });

  const handleFilterChange = (filters: FilterState) => {
    console.log("Filters changed:", filters);
    setActiveFilters(filters);
    // Here you could trigger a request to fetch filtered books
  };

  return (
    <div>
      <ShopHeader activeFilters={activeFilters} />
      <div className="flex flex-row gap-4 py-4">
        <div className="w-[15%]">
          <BookFilters onFilterChange={handleFilterChange} />
        </div>
        <div className="w-[2%]"></div>
        <div className="flex-grow">
          <div className="w-full flex flex-col gap-4">
            Info, sort and pagination settings
          </div>
          <div className="w-full flex flex-col gap-4 pt-4">
            Shop pagination
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
