import { ShopHeader } from "@/components/Header/ShopHeader";
import { BookFilters, FilterState } from "@/components/ui/filter";
import { useState, useEffect } from "react";
// Import shop API functions and types
import { getShopBooks, ShopParams, SortOption, VALID_PER_PAGE_OPTIONS, ValidPerPage } from "@/api/shop";
import { BookCard } from "@/components/ui/card";
// Import pagination components
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

// Define a more specific interface for the shop book items based on the API response
interface ShopBook {
  id: number;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  rating: number;
  category?: string;
  discount_price?: number | null;
}

const ShopPage = () => {
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    categories: [],
    authors: [],
    ratings: []
  });
  const [books, setBooks] = useState<ShopBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<ValidPerPage>(15); // Default to 15

  // Sort state
  const [sortOption, setSortOption] = useState<SortOption>('onsale');

  // Add a state variable for total books count
  const [totalBooks, setTotalBooks] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        // Create params object for the API call
        const params: ShopParams = {
          page: currentPage,
          limit: itemsPerPage,
          categories: activeFilters.categories.length > 0 ? activeFilters.categories : undefined,
          authors: activeFilters.authors.length > 0 ? activeFilters.authors : undefined,
          ratings: activeFilters.ratings.length > 0 ? activeFilters.ratings : undefined,
          sort: sortOption
        };

        // Call the shop API
        const response = await getShopBooks(params);

        // Transform the API response to match our ShopBook interface
        const transformedBooks: ShopBook[] = response.books.map(book => ({
          id: book.id,
          title: book.name,
          author: book.author,
          price: book.price,
          discount_price: book.discount_price,
          imageUrl: book.cover_photo || "/placeholder-book.png",
          rating: book.average_rating || 0,
          category: book.category
        }));

        setBooks(transformedBooks);
        setTotalPages(response.pages || 1);
        setTotalBooks(response.total || 0); // Store the total count from the API
      } catch (err) {
        setError("Failed to fetch books. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, activeFilters, itemsPerPage, sortOption]);

  const handleFilterChange = (filters: FilterState) => {
    console.log("Filters changed:", filters);
    setActiveFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the page for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value as SortOption);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const handlePerPageChange = (value: ValidPerPage) => {
    console.log("Changing items per page from", itemsPerPage, "to", value);
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when items per page changes
  };


  return (
    <div>
      <ShopHeader activeFilters={activeFilters} />
      <div className="flex flex-col md:flex-row gap-4 py-4">
        <div className="w-full md:w-[15%]">
          <BookFilters onFilterChange={handleFilterChange} />
        </div>
        <div className="hidden md:block md:w-[2%]"></div>
        <div className="flex-grow">
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="text-sm">
                  Showing {books?.length || 0} of {totalBooks} books
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <select
                  className="border p-2 rounded w-full sm:w-auto"
                  value={itemsPerPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value) as ValidPerPage)}
                >
                  {VALID_PER_PAGE_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option} per page
                    </option>
                  ))}
                </select>
                <select
                  className="border p-2 rounded w-full sm:w-auto"
                  onChange={handleSortChange}
                  value={sortOption}
                >
                  <option value="onsale">On Sale</option>
                  <option value="popularity">Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading books...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center mt-6">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    price={book.price}
                    originalPrice={book.discount_price ?? undefined}
                    imageUrl={book.imageUrl}
                  />
                ))}

                {books.length === 0 && !loading && (
                  <div className="col-span-full text-center py-10">
                    <p>No books found matching your criteria.</p>
                  </div>
                )}
              </div>

              {/* Pagination with shadcn/ui components */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {/* First page */}
                      <PaginationItem>
                        <PaginationLink
                          isActive={currentPage === 1}
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>

                      {/* Ellipsis if needed */}
                      {currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {/* Pages around current page */}
                      {Array.from({ length: totalPages }).map((_, index) => {
                        const pageNumber = index + 1;
                        // Show current page and adjacent pages
                        if (
                          pageNumber !== 1 &&
                          pageNumber !== totalPages &&
                          pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1
                        ) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                isActive={currentPage === pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}

                      {/* Ellipsis if needed */}
                      {currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {/* Last page (if more than 1 page) */}
                      {totalPages > 1 && (
                        <PaginationItem>
                          <PaginationLink
                            isActive={currentPage === totalPages}
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
