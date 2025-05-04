import { ShopHeader } from "@/components/Header/ShopHeader";
import { BookFilters, FilterState } from "@/components/ui/filter";
import { useState, useEffect, useCallback, useRef } from "react";
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

  // Dropdown state
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [perPageDropdownOpen, setPerPageDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const perPageDropdownRef = useRef<HTMLDivElement>(null);

  // Add a state variable for total books count
  const [totalBooks, setTotalBooks] = useState(0);

  // Add state for category and author names
  const [categoryMap, setCategoryMap] = useState<Map<number, string>>(new Map());
  const [authorMap, setAuthorMap] = useState<Map<number, string>>(new Map());

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
      if (perPageDropdownRef.current && !perPageDropdownRef.current.contains(event.target as Node)) {
        setPerPageDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleSortChange = (value: SortOption) => {
    // Set page to 1 first, then change the sort option
    setCurrentPage(1);
    setSortOption(value);
    setSortDropdownOpen(false);
  };

  const handlePerPageChange = (value: ValidPerPage) => {
    // Set page to 1 first, then change items per page
    setCurrentPage(1);
    setItemsPerPage(value);
    setPerPageDropdownOpen(false);
  };

  // Function to get sort option display text
  const getSortOptionText = (option: SortOption): string => {
    switch (option) {
      case 'onsale': return 'On Sale';
      case 'popularity': return 'Popularity';
      case 'price-asc': return 'Price: Low to High';
      case 'price-desc': return 'Price: High to Low';
      default: return 'On Sale';
    }
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
                  {/* Items per page dropdown */}
                  <div className="relative" ref={perPageDropdownRef}>
                    <button
                      className="flex items-center justify-between w-full sm:w-auto px-3 py-2 border border-gray-300 rounded hover:bg-gray-100"
                      onClick={() => setPerPageDropdownOpen(!perPageDropdownOpen)}
                    >
                      <span className="mr-1">{itemsPerPage} per page</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-200 ${perPageDropdownOpen ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>

                    {perPageDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                        {VALID_PER_PAGE_OPTIONS.map(option => (
                          <button
                            key={option}
                            onClick={() => handlePerPageChange(option)}
                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            {option} per page
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sort options dropdown */}
                  <div className="relative" ref={sortDropdownRef}>
                    <button
                      className="flex items-center justify-between w-full sm:w-auto px-3 py-2 border border-gray-300 rounded hover:bg-gray-100"
                      onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    >
                      <span className="mr-1">{getSortOptionText(sortOption)}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-200 ${sortDropdownOpen ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>

                    {sortDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                        <button
                          onClick={() => handleSortChange('onsale')}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          On Sale
                        </button>
                        <button
                          onClick={() => handleSortChange('popularity')}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Popularity
                        </button>
                        <button
                          onClick={() => handleSortChange('price-asc')}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Price: Low to High
                        </button>
                        <button
                          onClick={() => handleSortChange('price-desc')}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Price: High to Low
                        </button>
                      </div>
                    )}
                  </div>
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
