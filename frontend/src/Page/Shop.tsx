import { ShopHeader } from "@/components/Header/ShopHeader";
import { BookFilters, FilterState } from "@/components/ui/filter";
import { useState, useEffect, useCallback } from "react";
// Import shop API functions and types
import {
  getShopBooks,
  ShopParams,
  SortOption,
  VALID_PER_PAGE_OPTIONS,
  ValidPerPage,
  BookViewModel,
  transformToViewModel
} from "@/api/shop";
import { BookCard } from "@/components/ui/card";
// Import the ShopPagination component
import ShopPagination from "@/components/Pagination/ShopPagination";
import { getCategories, Category } from "@/api/category";
import { getAuthors, Author } from "@/api/author";

const ShopPage = () => {
  // --- STATE DEFINITIONS ---
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    categories: [],
    authors: [],
    ratings: []
  });
  const [books, setBooks] = useState<BookViewModel[]>([]);
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

  // Add state for category and author names
  const [categoryMap, setCategoryMap] = useState<Map<number, string>>(new Map());
  const [authorMap, setAuthorMap] = useState<Map<number, string>>(new Map());

  // Load categories and authors
  useEffect(() => {
    // Fetch categories
    getCategories()
      .then((categories: Category[]) => {
        const newCategoryMap = new Map<number, string>();
        categories.forEach(category => {
          newCategoryMap.set(category.id, category.category_name);
        });
        setCategoryMap(newCategoryMap);
      })
      .catch(error => {
        console.error("Failed to load categories:", error);
      });

    // Fetch authors
    getAuthors()
      .then((authors: Author[]) => {
        const newAuthorMap = new Map<number, string>();
        authors.forEach(author => {
          newAuthorMap.set(author.id, author.author_name);
        });
        setAuthorMap(newAuthorMap);
      })
      .catch(error => {
        console.error("Failed to load authors:", error);
      });
  }, []);

  // --- DATA FETCH FUNCTION ---
  const fetchBooks = useCallback(async () => {
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

      // Transform the API response to match our BookViewModel interface
      const transformedBooks: BookViewModel[] = response.books.map(transformToViewModel);

      setBooks(transformedBooks);
      setTotalPages(response.pages || 1);
      setTotalBooks(response.total || 0); // Store the total count from the API
    } catch {
      setError("Failed to fetch books. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters, itemsPerPage, sortOption]);

  // Call fetchBooks whenever the dependencies change
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // --- HANDLER FUNCTIONS ---
  const handleFilterChange = (filters: FilterState) => {
    // Important: Set current page to 1 BEFORE setting the activeFilters
    // This ensures the page reset happens before the next API call
    setCurrentPage(1);

    // Then update filters
    setActiveFilters(filters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the page for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Set page to 1 first, then change the sort option
    setCurrentPage(1);
    setSortOption(event.target.value as SortOption);
  };

  const handlePerPageChange = (value: ValidPerPage) => {
    // Set page to 1 first, then change items per page
    setCurrentPage(1);
    setItemsPerPage(value);
  };

  // --- MAIN RENDER ---
  return (
    <div>
      {/* --- HEADER SECTION --- */}
      <ShopHeader
        activeFilters={activeFilters}
        categoryNames={categoryMap}
        authorNames={authorMap}
      />
      <div className="flex flex-col md:flex-row gap-4 py-4">
        {/* --- FILTERS SECTION --- */}
        <div className="w-full md:w-[15%] md:min-w-[15%] md:max-w-[15%] flex-shrink-0">
          <div className="w-full overflow-hidden">
            <BookFilters onFilterChange={handleFilterChange} />
          </div>
        </div>
        <div className="hidden md:block md:w-[20px] md:min-w-[20px] md:max-w-[20px] flex-shrink-0"></div>
        {/* --- BOOKS DISPLAY SECTION --- */}
        <div className="flex-grow">
          <div className="w-full">
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  {totalBooks > 0 ? (
                    <p className="text-sm">
                      Showing {itemsPerPage * (currentPage - 1) + 1}-{Math.min(itemsPerPage * currentPage, totalBooks)} of {totalBooks} books
                    </p>
                  ) : (
                    <p className="text-sm">
                      Showing 0-0 of 0 books
                    </p>
                  )}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center mt-6">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.book_title}
                    author={book.author}
                    price={book.price}
                    originalPrice={book.discountPrice ?? undefined}
                    imageUrl={book.imageUrl}
                  />
                ))}

                {books.length === 0 && !loading && (
                  <div className="col-span-full text-center py-10">
                    <p>No books found matching your criteria.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination with reduced top spacing */}
          {!loading && !error && books.length > 0 && (
            <div className="-mt-1">
              <ShopPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
