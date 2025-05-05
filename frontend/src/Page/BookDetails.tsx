// src/Page/BookDetails.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { BookHeader } from '../components/Header/BookHeader';
import { Button } from '../components/ui/button';
import { ReviewForm } from '../components/ui/reviewForm';
import { ReviewItem } from '../components/ui/reviewItem';
import { QuantitySelector } from '@/components/ui/quantitySelector';
import { dispatchCartUpdateEvent } from '@/hooks/useCartEvents';
import { useBookDetails } from '@/hooks/useBookDetails';

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
import { Dropdown, DropdownOption } from '@/components/ui/dropdown';
import { VALID_PER_PAGE_OPTIONS, ValidPerPage } from '@/api/shop';

/* Type definitions */
// Review type from API
type Review = ReviewPostResponse;
type SortOptionReview = 'newest' | 'oldest';

// Cart item structure for localStorage
interface CartItem {
  id: number;
  quantity: number;
}

const BookDetails = () => {
  /* URL parameters */
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;

  /* Book data state */
  const { book, loading: bookLoading, error: bookError } = useBookDetails(numericId);
  const [quantity, setQuantity] = useState(1);

  /* Reviews state */
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<ValidPerPage>(15);
  const [sortOrder, setSortOrder] = useState<SortOptionReview>('newest');
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [bookStats, setBookStats] = useState<BookStatsResponse>({ items: [] });
  const [activeRatingFilter, setActiveRatingFilter] = useState<number | null>(null);

  /* Fetch book statistics (rating counts, review counts) */
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

  /* Fetch book reviews with filtering options */
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

  /* Load reviews and stats when dependencies change */
  useEffect(() => {
    if (numericId) {
      fetchReviews();
      fetchBookStats();
    }
  }, [numericId, fetchReviews, fetchBookStats]);

  /* Pagination handlers */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getSortOptionText = (option: SortOptionReview): string => {
    switch (option) {
      case 'newest': return 'Newest to oldest';
      case 'oldest': return 'Oldest to newest';
    }
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

  /* Per-page display settings handler */
  const handlePerPageChange = (value: ValidPerPage) => {
    setPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  /* Sort order handler */
  const handleSortChange = (value: SortOptionReview) => {
    setSortOrder(value);
    setCurrentPage(1); // Reset to first page when changing sort order
  };

  const perPageOptions: DropdownOption<ValidPerPage>[] = VALID_PER_PAGE_OPTIONS.map(option => ({
    value: option,
    label: `${option} per page`
  }));

  const sortOptions: DropdownOption<SortOptionReview>[] = [
    { value: 'newest', label: 'Newest to oldest' },
    { value: 'oldest', label: 'Oldest to newest' }
  ];

  /* Add to cart functionality */
  const handleAddToCart = () => {
    if (!book) {
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

  /* Rating filter handler */
  const handleRatingFilterClick = (rating: number | null) => {
    setActiveRatingFilter(rating);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  /* Helper to get review count based on active filter */
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

  /* Loading and error states */
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
      {/* Page Header with Category */}
      <BookHeader text={book.category} />

      {/* Main Content Container */}
      <div className="flex flex-col lg:flex-row gap-4 lg:justify-between">
        {/* Book Information Panel */}
        <div className="w-full lg:w-[68%] border-2 border-gray-400 rounded-lg flex flex-col relative p-4">
          <div className='flex flex-col md:flex-row gap-6'>
            {/* Book Cover Image */}
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

            {/* Book Details */}
            <div className='w-full md:w-[50%] mt-4 md:mt-0'>
              <p className='font-bold text-xl md:text-2xl mb-3'>{book.book_title}</p>
              <p className='text-left'>{book.book_summary}</p>
            </div>
          </div>
        </div>

        {/* Purchase Box */}
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
              onIncrement={() => setQuantity(q => Math.min(q + 1, 8))}
              onDecrement={() => setQuantity(q => (q > 1 ? q - 1 : 1))}
              readOnly={false}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  setQuantity(val);
                }
              }}
            />
          </div>

          <Button className="w-full py-6" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="flex flex-col lg:flex-row gap-4 lg:justify-between pt-4">
        {/* Reviews List Panel */}
        <div className="w-full lg:w-[68%] border-2 border-gray-400 rounded-lg">
          <div className='flex flex-col gap-4 px-4 py-8'>
            <div className='font-bold text-xl'>
              Customer Reviews
            </div>

            {/* Average Rating Display */}
            <div className='font-bold text-4xl flex items-center gap-2'>
              <div>{currentBookStats.avg_rating.toFixed(1)} Star</div>
            </div>

            {/* Rating Filter Options */}
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

            {/* Review Controls and Info */}
            <div className='flex justify-between gap-2'>
              {/* Pagination Summary */}
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
                {/* Sort Order Dropdown */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {/* Items per page dropdown */}
                  <Dropdown<ValidPerPage>
                    value={perPage}
                    options={perPageOptions}
                    onChange={handlePerPageChange}
                  />

                  {/* Sort options dropdown */}
                  <Dropdown<SortOptionReview>
                    value={sortOrder}
                    options={sortOptions}
                    onChange={handleSortChange}
                    buttonLabel={getSortOptionText}
                  />
                </div>
              </div>
            </div>

            {/* Reviews List */}
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

            {/* Pagination Navigation */}
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

        {/* Review Submission Form */}
        <div className='w-full lg:w-[30%]'>
          <ReviewForm book_id={numericId ?? 0} />
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
