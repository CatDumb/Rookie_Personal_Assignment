import { ShopHeader } from "@/components/Header/ShopHeader";
import { BookFilters, FilterState } from "@/components/ui/filter";
import { useState, useEffect, useCallback } from "react";
// Import shop API functions and types
import {
  getShopBooks,
  ShopParams,
  SortOptionShop,
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
import { Dropdown, DropdownOption } from "@/components/ui/dropdown";

const ShopPage = () => {
  /* State Management */
  // Filter-related state
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    categories: [],
    authors: [],
    ratings: []
  });

  // Book data state
  const [books, setBooks] = useState<BookViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<ValidPerPage>(15);
  const [totalBooks, setTotalBooks] = useState(0);

  // Sort state
  const [sortOption, setSortOption] = useState<SortOptionShop>('onsale');

  // Mapping collections for display
  const [categoryMap, setCategoryMap] = useState<Map<number, string>>(new Map());
  const [authorMap, setAuthorMap] = useState<Map<number, string>>(new Map());

  /* Load category and author data for filtering */
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

  /* Main data fetching function */
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
      setTotalBooks(response.total || 0);
    } catch {
      setError("Failed to fetch books. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters, itemsPerPage, sortOption]);

  /* Trigger data fetch when dependencies change */
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  /* Event Handlers */
  // Handle filter changes
  const handleFilterChange = (filters: FilterState) => {
    // Reset to first page when filters change
    setCurrentPage(1);
    setActiveFilters(filters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the page for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort option changes
  const handleSortChange = (value: SortOptionShop) => {
    // Reset to first page when sort changes
    setCurrentPage(1);
    setSortOption(value);
  };

  // Handle items per page changes
  const handlePerPageChange = (value: ValidPerPage) => {
    // Reset to first page when per-page setting changes
    setCurrentPage(1);
    setItemsPerPage(value);
  };

  /* Helper Functions */
  // Get display text for sort options
  const getSortOptionText = (option: SortOptionShop): string => {
    switch (option) {
      case 'onsale': return 'On Sale';
      case 'popularity': return 'Popularity';
      case 'price-asc': return 'Price: Low to High';
      case 'price-desc': return 'Price: High to Low';
      default: return 'On Sale';
    }
  };

  // Create dropdown options for items per page
  const perPageOptions: DropdownOption<ValidPerPage>[] = VALID_PER_PAGE_OPTIONS.map(option => ({
    value: option,
    label: `${option} per page`
  }));

  // Create dropdown options for sort
  const sortOptions: DropdownOption<SortOptionShop>[] = [
    { value: 'onsale', label: 'On Sale' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' }
  ];

  /* Component Rendering */
  return (
    <div>
      {/* Shop Header - Contains banner and active filter indicators */}
      <ShopHeader
        activeFilters={activeFilters}
        categoryNames={categoryMap}
        authorNames={authorMap}
      />
      <div className="flex flex-col md:flex-row gap-4 py-4">
        {/* Left Sidebar - Filter Controls */}
        <div className="w-full md:w-[15%] md:min-w-[15%] md:max-w-[15%] flex-shrink-0">
          <div className="w-full overflow-hidden">
            <BookFilters onFilterChange={handleFilterChange} />
          </div>
        </div>
        {/* Spacer for layout */}
        <div className="hidden md:block md:w-[20px] md:min-w-[20px] md:max-w-[20px] flex-shrink-0"></div>
        {/* Main Content Area - Books Grid and Controls */}
        <div className="flex-grow">
          <div className="w-full">
            <div className="w-full flex flex-col gap-4">
              {/* Results Summary and Controls Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                {/* Results Count */}
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
                {/* Sort and Pagination Controls */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {/* Items per page dropdown */}
                  <Dropdown<ValidPerPage>
                    value={itemsPerPage}
                    options={perPageOptions}
                    onChange={handlePerPageChange}
                  />

                  {/* Sort options dropdown */}
                  <Dropdown<SortOptionShop>
                    value={sortOption}
                    options={sortOptions}
                    onChange={handleSortChange}
                    buttonLabel={getSortOptionText}
                  />
                </div>
              </div>
            </div>

            {/* Book Grid with Loading and Error States */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading books...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center mt-6">
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

          {/* Pagination Controls */}
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
