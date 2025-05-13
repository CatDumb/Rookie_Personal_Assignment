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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
      case 'newest': return t('sort_newest_to_oldest');
      case 'oldest': return t('sort_oldest_to_newest');
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
    { value: 'newest', label: t('sort_newest_to_oldest') },
    { value: 'oldest', label: t('sort_oldest_to_newest') }
  ];

  /* Add to cart functionality */
  const handleAddToCart = () => {
    if (!book) {
      return;
    }

    const MAX_QUANTITY = 8; // Define maximum quantity per item

    // Get current cart items from localStorage
    const cartItemsJson = localStorage.getItem('cart');
    const cartItems: CartItem[] = cartItemsJson ? JSON.parse(cartItemsJson) : [];

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex((item: CartItem) => item.id === book.id);

    if (existingItemIndex > -1) {
      // Calculate the new total quantity
      const newTotalQuantity = cartItems[existingItemIndex].quantity + quantity;

      // Check if new total exceeds max quantity
      if (newTotalQuantity > MAX_QUANTITY) {
        // Alert user that they've reached the maximum quantity
        const currentQuantity = cartItems[existingItemIndex].quantity;
        const remainingQuantity = MAX_QUANTITY - currentQuantity;

        if (remainingQuantity > 0) {
          alert(`${t('book_details_max_quantity_alert_1')} ${currentQuantity} ${t('book_details_max_quantity_alert_2')} ${remainingQuantity} ${t('book_details_max_quantity_alert_3')}`);
        } else {
          alert(`${t('book_details_max_quantity_alert_4')} (${MAX_QUANTITY}) ${t('book_details_max_quantity_alert_5')}`);
        }
        return;
      }

      // Update quantity if item exists and doesn't exceed maximum
      cartItems[existingItemIndex].quantity = newTotalQuantity;
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
    alert(`${t('book_details_added_to_cart')} ${book.book_title} (${t('book_details_quantity_to_cart')} ${quantity}) ${t('book_details_to_your_cart')}`);
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
    return <div className="text-center py-20">{t('book_details_loading')}</div>;
  }

  if (bookError) {
    return <div className="text-center py-20 text-red-500">{t('book_details_error')}</div>;
  }

  if (!book) {
    return <div className="text-center py-20">{t('book_details_not_found')}</div>;
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
      <div className="flex flex-col lg:flex-row gap-4 pt-4 lg:justify-between">
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
                <span className='font-light'>{t('book_details_by_author')} <span className='font-bold'>{book.author}</span></span>
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
            {t('book_details_quantity')}
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
            {t('book_details_add_to_cart')}
          </Button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="flex flex-col lg:flex-row gap-4 lg:justify-between pt-4">
        {/* Reviews List Panel */}
        <div className="w-full lg:w-[68%] border-2 border-gray-400 rounded-lg">
          <div className='flex flex-col gap-4 px-4 py-8'>
            <div className='flex flex-row gap-2 items-baseline'>
              <div className='font-bold text-xl'>
                {t('book_reviews_customer_reviews')}
              </div>

              <div className='text-gray-500 text-sm'>
                ({t('book_reviews_filter_by_rating')} {activeRatingFilter ? `${activeRatingFilter} ${t('book_reviews_star')}` : t('book_reviews_all')})
              </div>
            </div>

            {/* Average Rating Display */}
            <div className='font-bold text-4xl flex items-center gap-2'>
              <div>{currentBookStats.avg_rating.toFixed(1)} {t('book_reviews_star')}</div>
            </div>

            {/* Rating Filter Options */}
            <div>
              <div className="flex flex-row divide-x divide-gray-300">
                <div
                  className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === null ? 'font-bold underline' : ''}`}
                  onClick={() => handleRatingFilterClick(null)}
                >
                  {t('book_reviews_all')} ({currentBookStats.review_count})
                </div>
                <div
                  className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 5 ? 'font-bold underline' : ''}`}
                  onClick={() => handleRatingFilterClick(5)}
                >
                  5 {t('book_reviews_star')} ({currentBookStats.star_5})
                </div>
                <div
                  className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 4 ? 'font-bold underline' : ''}`}
                  onClick={() => handleRatingFilterClick(4)}
                >
                  4 {t('book_reviews_star')} ({currentBookStats.star_4})
                </div>
                <div
                  className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 3 ? 'font-bold underline' : ''}`}
                  onClick={() => handleRatingFilterClick(3)}
                >
                  3 {t('book_reviews_star')} ({currentBookStats.star_3})
                </div>
                <div
                  className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 2 ? 'font-bold underline' : ''}`}
                  onClick={() => handleRatingFilterClick(2)}
                >
                  2 {t('book_reviews_star')} ({currentBookStats.star_2})
                </div>
                <div
                  className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 1 ? 'font-bold underline' : ''}`}
                  onClick={() => handleRatingFilterClick(1)}
                >
                  1 {t('book_reviews_star')} ({currentBookStats.star_1})
                </div>
              </div>
            </div>

            {/* Review Controls and Info */}
            <div className='flex justify-between gap-2'>
              {/* Pagination Summary */}
              <div className="text-center text-gray-500">
                {totalReviews > 0 ? (
                  <>
                    {t('book_reviews_showing')} {Math.min((currentPage - 1) * perPage + 1, activeRatingFilter ? getFilteredReviewCount() : totalReviews)} {t('book_reviews_to')} {Math.min(currentPage * perPage, activeRatingFilter ? getFilteredReviewCount() : totalReviews)} {t('book_reviews_of')} {activeRatingFilter ? getFilteredReviewCount() : totalReviews} {t('book_reviews_reviews')}
                  </>
                ) : (
                  <>{t('book_reviews_no_reviews')}</>
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
                <div className="text-center py-4">{t('book_reviews_loading')}</div>
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
                <div className="text-center py-4 text-gray-500">{t('book_reviews_no_reviews_yet')}</div>
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
