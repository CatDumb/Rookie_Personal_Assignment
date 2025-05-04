// src/Page/BookDetails.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { BookHeader } from '../components/Header/BookHeader';
import { Button } from '../components/ui/button';
import { ReviewForm } from '../components/ui/reviewForm';
import { ReviewItem } from '../components/ui/reviewItem';
import { QuantitySelector } from '@/components/ui/quantitySelector';
import { dispatchCartUpdateEvent } from '@/components/Context/CartContext';
import { useBookDetails } from '@/hooks/useBookDetails';
import { useAuth } from '../components/Context/AuthContext';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { getReviews, ReviewFilterRequest, ReviewPostResponse, getBookStats, BookStatsResponse } from '@/api/review';

// Use the ReviewPostResponse type from the API
type Review = ReviewPostResponse;

// Type for cart items
interface CartItem {
  id: number;
  quantity: number;
}

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;

  const { book, loading: bookLoading, error: bookError } = useBookDetails(numericId);
  const [quantity, setQuantity] = useState(1);
  const { isLoggedIn } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [bookStats, setBookStats] = useState<BookStatsResponse>({ items: [] });
  const [activeRatingFilter, setActiveRatingFilter] = useState<number | null>(null);

  // Dropdown state
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [perPageDropdownOpen, setPerPageDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const perPageDropdownRef = useRef<HTMLDivElement>(null);

  const fetchBookStats = useCallback(async () => {
    if (!numericId) return;

    try {
      const stats = await getBookStats(numericId);
      console.log("Book stats received:", stats);
      setBookStats(stats || { items: [] });
    } catch (error) {
      console.error('Failed to fetch book stats:', error);
      setBookStats({ items: [] }); // Default empty stats
    }
  }, [numericId]);

  const fetchReviews = useCallback(async () => {
    if (!numericId) return;

    setLoadingReviews(true);
    try {
      const filters: ReviewFilterRequest = {
        book_id: numericId,
        page: currentPage,
        per_page: perPage,
        sort_order: sortOrder,
        rating: activeRatingFilter || undefined
      };

      const response = await getReviews(filters);
      setReviews(response.items || []);
      setTotalPages(response.pages || 1);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setReviews([]);
      setTotalPages(1);
    } finally {
      setLoadingReviews(false);
    }
  }, [numericId, currentPage, perPage, sortOrder, activeRatingFilter]);

  useEffect(() => {
    if (numericId) {
      fetchReviews();
      fetchBookStats();
    }
  }, [numericId, fetchReviews, fetchBookStats]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
    setPerPageDropdownOpen(false);
  };

  const handleSortOrderChange = (value: 'newest' | 'oldest') => {
    setSortOrder(value);
    setCurrentPage(1); // Reset to first page when changing sort order
    setSortDropdownOpen(false);
  };

  const handleAddToCart = () => {
    if (!book) {
      return;
    }

    if (!isLoggedIn) {
      alert('Please log in to add items to your cart.');
      return;
    }

    // Get current cart items from localStorage
    const cartItemsJson = localStorage.getItem('cart');
    const cartItems: CartItem[] = cartItemsJson ? JSON.parse(cartItemsJson) : [];

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex((item: CartItem) => item.id === book.id);

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item if it doesn't exist
      cartItems.push({
        id: book.id,
        quantity: quantity
      });
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));

    // Update cart display in navbar (dispatch event to update cart count)
    dispatchCartUpdateEvent();

    // Alert user that item was added
    alert(`Added ${book.book_title} (Quantity: ${quantity}) to your cart.`);
  };

  // New function to handle rating filter clicks
  const handleRatingFilterClick = (rating: number | null) => {
    setActiveRatingFilter(rating);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const getFilteredReviewCount = (): number => {
    if (!activeRatingFilter) return totalReviews;

    switch (activeRatingFilter) {
      case 5: return currentBookStats.star_5;
      case 4: return currentBookStats.star_4;
      case 3: return currentBookStats.star_3;
      case 2: return currentBookStats.star_2;
      case 1: return currentBookStats.star_1;
      default: return totalReviews;
    }
  };

  /* LOADING STATES */
  if (bookLoading) {
    return <div className="text-center py-20">Loading book details...</div>;
  }

  if (bookError) {
    return <div className="text-center py-20 text-red-500">{bookError}</div>;
  }

  if (!book) {
    return <div className="text-center py-20">Book not found</div>;
  }

  // Get current book stats safely
  const currentBookStats = bookStats?.items?.[0] || {
    review_count: 0,
    avg_rating: 0,
    star_5: 0,
    star_4: 0,
    star_3: 0,
    star_2: 0,
    star_1: 0
  };

  // Total reviews count
  const totalReviews = currentBookStats.review_count || 0;

  return (
    <div>
      {/* HEADER AND CATEGORY */}
      <BookHeader text={book.category} />

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col lg:flex-row gap-4 lg:justify-between">
        {/* BOOK DETAILS SECTION */}
        <div className="w-full lg:w-[68%] border-2 border-gray-400 rounded-lg flex flex-col relative p-4">
          <div className='flex flex-col md:flex-row gap-6'>
            {/* BOOK COVER */}
            <div className='w-full md:w-[30%] flex flex-col'>
              <div className="max-w-[300px] mx-auto md:mx-0">
                {book.book_cover_photo ? (
                  <img
                    src={book.book_cover_photo}
                    alt={book.book_title}
                    className="w-full h-auto object-contain rounded"
                    onError={(e) => {
                      console.log("Image load error for:", book.book_cover_photo);
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/book.png";
                    }}
                    loading="lazy"
                  />
                ) : (
                  <img src="/book.png" alt="Default book cover" className="w-full h-auto rounded" />
                )}
              </div>
              <div className='text-right mt-2'>
                <span className='font-light'>By (author) <span className='font-bold'>{book.author}</span></span>
              </div>
            </div>

            {/* BOOK INFO */}
            <div className='w-full md:w-[50%] mt-4 md:mt-0'>
              <p className='font-bold text-xl md:text-2xl mb-3'>{book.book_title}</p>
              <p className='text-left'>{book.book_summary}</p>
            </div>
          </div>
        </div>

        {/* PURCHASE BOX */}
        <div className="w-full lg:w-[30%] h-fit border-2 border-gray-400 rounded-lg p-4">
          <div className="font-bold text-3xl mb-6 text-center">
            {book.discount_price !== null ? (
              <div className="flex items-left gap-3 border-b border-gray-400 -mx-4 pb-4 pl-4">
                <div className='flex items-center gap-3'>
                  <span className="text-lg line-through text-gray-500">${book.book_price.toFixed(2)}</span>
                  <span>${book.discount_price.toFixed(2)}</span>
                </div>

              </div>
            ) : (
              <div className="flex items-left gap-3 border-b border-gray-400 -mx-4 pb-4 pl-4">
                <div className='flex items-center gap-3'>
                   <span>${book.book_price.toFixed(2)}</span>
                </div>
              </div>

            )}
          </div>

          <div className='text-left text-gray-500'>
            Quantity
          </div>
          <div className="mb-8">
            <QuantitySelector
              quantity={quantity}
              onIncrement={() => setQuantity(q => q + 1)}
              onDecrement={() => setQuantity(q => (q > 1 ? q - 1 : 1))}
              readOnly={false}
            />
          </div>

          <Button className="w-full py-6" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:justify-between pt-4">
        {/* REVIEWS LIST */}
        <div className="w-full lg:w-[68%] border-2 border-gray-400 rounded-lg">
          <div className='flex flex-col gap-4 px-4 py-8'>
            <div className='font-bold text-xl'>
              Customer Reviews
            </div>

            {/* RATING SUMMARY */}
            <div className='font-bold text-4xl flex items-center gap-2'>
              <div>{currentBookStats.avg_rating.toFixed(1)} Star</div>
            </div>

            {/* RATING DISTRIBUTION */}
            <div>
              <div className="flex flex-row divide-x divide-gray-300">
                <div
                  className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === null ? 'font-bold underline' : ''}`}
                  onClick={() => handleRatingFilterClick(null)}
                >
                  All ({currentBookStats.review_count})
                </div>
                <div
                  className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 5 ? 'font-bold underline' : ''}`}
                  onClick={() => handleRatingFilterClick(5)}
                >
                  5 Star ({currentBookStats.star_5})
                </div>
                <div
                  className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 4 ? 'font-bold underline' : ''}`}
                  onClick={() => handleRatingFilterClick(4)}
                >
                  4 Star ({currentBookStats.star_4})
                </div>
                <div
                  className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 3 ? 'font-bold underline' : ''}`}
                  onClick={() => handleRatingFilterClick(3)}
                >
                  3 Star ({currentBookStats.star_3})
                </div>
                <div
                  className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 2 ? 'font-bold underline' : ''}`}
                  onClick={() => handleRatingFilterClick(2)}
                >
                  2 Star ({currentBookStats.star_2})
                </div>
                <div
                  className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 1 ? 'font-bold underline' : ''}`}
                  onClick={() => handleRatingFilterClick(1)}
                >
                  1 Star ({currentBookStats.star_1})
                </div>
              </div>
            </div>

            <div className='flex justify-between gap-2'>
              {/* Pagination index */}
              <div className="text-center text-gray-500">
                {totalReviews > 0 ? (
                  <>
                    Showing {Math.min((currentPage - 1) * perPage + 1, activeRatingFilter ? getFilteredReviewCount() : totalReviews)} to {Math.min(currentPage * perPage, activeRatingFilter ? getFilteredReviewCount() : totalReviews)} of {activeRatingFilter ? getFilteredReviewCount() : totalReviews} reviews
                  </>
                ) : (
                  <>No reviews to display</>
                )}
              </div>

              <div className='flex justify-between gap-2'>
                {/* Sorting options */}
                <div className="text-right text-gray-500 relative" ref={sortDropdownRef}>
                  <button
                    className="flex items-center justify-center px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  >
                    <span className="mr-1">
                      {sortOrder === 'newest' ? 'Newest to oldest' : 'Oldest to newest'}
                    </span>
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
                        onClick={() => handleSortOrderChange('newest')}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Newest to oldest
                      </button>
                      <button
                        onClick={() => handleSortOrderChange('oldest')}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Oldest to newest
                      </button>
                    </div>
                  )}
                </div>

                {/* Pagination per page */}
                <div className="text-right text-gray-500 relative" ref={perPageDropdownRef}>
                  <button
                    className="flex items-center justify-center px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                    onClick={() => setPerPageDropdownOpen(!perPageDropdownOpen)}
                  >
                    <span className="mr-1">Show {perPage}</span>
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
                      <button
                        onClick={() => handlePerPageChange(5)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Show 5
                      </button>
                      <button
                        onClick={() => handlePerPageChange(15)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Show 15
                      </button>
                      <button
                        onClick={() => handlePerPageChange(20)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Show 20
                      </button>
                      <button
                        onClick={() => handlePerPageChange(25)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Show 25
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* REVIEW ITEMS */}
            <div className="mt-4">
              {loadingReviews ? (
                <div className="text-center py-4">Loading reviews...</div>
              ) : reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <ReviewItem
                    key={index}
                    title={review.review_title}
                    content={review.review_details || ''}
                    date={review.review_date}
                    rating={review.rating_star}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No reviews yet</div>
              )}
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={prevPage}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {[...Array(totalPages).keys()].map((_, index) => {
                    const pageNumber = index + 1;
                    if (pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
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
                    if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                      return <PaginationItem key={`ellipsis-${pageNumber}`}><PaginationEllipsis /></PaginationItem>;
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={nextPage}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>

        {/* REVIEW FORM */}
        <div className='w-full lg:w-[30%]'>
          <ReviewForm book_id={numericId ?? 0} />
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
