// src/Page/BookDetails.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { BookHeader } from '../components/Header/BookHeader';
import { Button } from '../components/ui/button';
import { ReviewForm } from '../components/ui/reviewForm';
import { ReviewItem } from '../components/ui/reviewItem';
import { useAuth } from '@/components/Context/AuthContext';
import { QuantitySelector } from '@/components/ui/quantitySelector';
import { dispatchCartUpdateEvent } from '@/components/Context/CartContext';
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

// Use the ReviewPostResponse type from the API
type Review = ReviewPostResponse;

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;

  const { book, loading: bookLoading, error: bookError } = useBookDetails(numericId);
  const [quantity, setQuantity] = useState(1);
  const { isLoggedIn } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [bookStats, setBookStats] = useState<BookStatsResponse | null>(null);
  const [activeRatingFilter, setActiveRatingFilter] = useState<number | null>(null);

  const fetchBookStats = useCallback(async () => {
    if (!numericId) return;

    try {
      const stats = await getBookStats(numericId);
      setBookStats(stats);
    } catch (error) {
      console.error('Failed to fetch book stats:', error);
    }
  }, [numericId]);

  const fetchReviews = useCallback(async () => {
    if (!numericId) return;

    setLoadingReviews(true);
    try {
      const filters: ReviewFilterRequest = {
        book_id: numericId,
        page: currentPage,
        per_page: 5,
        sort_order: 'newest',
        rating: activeRatingFilter || undefined
      };

      const response = await getReviews(filters);
      setReviews(response.items);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  }, [numericId, currentPage, activeRatingFilter]);

  useEffect(() => {
    if (numericId) {
      fetchReviews();
      fetchBookStats();
    }
  }, [numericId, fetchReviews, fetchBookStats]);

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

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const incrementQuantity = () => {
    setQuantity(prev => (prev < 8 ? prev + 1 : 8));
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      alert('Please log in to add items to your cart.');
      return;
    }
    if (book) {
      try {
        const existingCart = localStorage.getItem('cart');
        let cart = existingCart ? JSON.parse(existingCart) : [];

        if (!Array.isArray(cart)) {
          console.error('Cart data in local storage is not an array. Resetting.');
          cart = [];
        }

        const existingItemIndex = cart.findIndex((item: { id: number }) => item.id === book.id);

        if (existingItemIndex > -1) {
          const currentQuantityInCart = cart[existingItemIndex].quantity;
          const potentialQuantity = currentQuantityInCart + quantity;
          const MAX_QUANTITY = 8;

          if (currentQuantityInCart >= MAX_QUANTITY) {
              alert('You already have the maximum quantity (8) of this item in your cart.');
              return;
          } else if (potentialQuantity > MAX_QUANTITY) {
              const quantityToAdd = MAX_QUANTITY - currentQuantityInCart;
              cart[existingItemIndex].quantity = MAX_QUANTITY;
              alert(`Quantity limit reached. Added ${quantityToAdd} item(s) to reach the maximum of ${MAX_QUANTITY}.`);
          } else {
              cart[existingItemIndex].quantity += quantity;
              alert('Item quantity updated in cart!');
          }

        } else {
          const MAX_QUANTITY = 8;
          let quantityToAdd = quantity;
          let alertMessage = 'Item added to cart!';

          if (quantity > MAX_QUANTITY) {
              quantityToAdd = MAX_QUANTITY;
              alertMessage = `Quantity limit is ${MAX_QUANTITY}. Added ${MAX_QUANTITY} items to cart.`;
          }

          const newItem = { id: book.id, quantity: quantityToAdd };
          cart.push(newItem);
          alert(alertMessage);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        dispatchCartUpdateEvent();
      } catch (error) {
        console.error('Failed to parse cart from local storage or save item:', error);
        alert('Error adding item to cart. Please try again.');
        if (book) {
          localStorage.setItem('cart', JSON.stringify([{ id: book.id, quantity: quantity }]));
          dispatchCartUpdateEvent();
        } else {
          console.error('Cannot add item to cart because book details are missing.');
          alert('Error adding item to cart. Book details unavailable.');
        }
      }
    }
  };

  // New function to handle rating filter clicks
  const handleRatingFilterClick = (rating: number | null) => {
    setActiveRatingFilter(rating);
    setCurrentPage(1); // Reset to first page when changing filters
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
        <div className="w-full lg:w-[30%] border-2 border-gray-400 rounded-lg flex flex-col relative mt-4 lg:mt-0 lg:h-fit">
          {/* PRICE DISPLAY */}
          <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-200 rounded-t-lg">
            <span className={book.discount_price ? "text-md line-through" : "text-2xl text-black font-bold break-words"}>
              ${book.book_price}
            </span>
            {book.discount_price && (
              <span className="text-2xl text-black font-bold break-words">
                ${book.discount_price}
              </span>
            )}
          </div>

          {/* QUANTITY SELECTOR */}
          <div className='flex flex-col gap-4 p-4'>
            <div className=''>
              <label className="block mb-2">Quantity</label>
              <QuantitySelector
                quantity={quantity}
                onDecrement={decrementQuantity}
                onIncrement={incrementQuantity}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddToCart}
            >
              Add to cart
            </Button>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="flex flex-col lg:flex-row gap-4 lg:justify-between pt-4">
        {/* REVIEWS LIST */}
        <div className="w-full lg:w-[68%] border-2 border-gray-400 rounded-lg">
          <div className='flex flex-col gap-4 px-4 py-8'>
            <div className='font-bold text-xl'>
              Customer Reviews
            </div>

            {/* RATING SUMMARY */}
            <div className='font-bold text-4xl flex items-center gap-2'>
              {bookStats && bookStats.items && bookStats.items.length > 0 ? (
                  <div>{bookStats.items[0].avg_rating} Star</div>
              ) : (
                <span>Loading ratings...</span>
              )}
            </div>

            {/* RATING DISTRIBUTION */}
            {bookStats && bookStats.items && bookStats.items.length > 0 && (
              <div>
                <div className="flex flex-row divide-x divide-gray-300">
                  <div
                    className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === null ? 'font-bold underline' : ''}`}
                    onClick={() => handleRatingFilterClick(null)}
                  >
                    All ({bookStats.items[0].review_count})
                  </div>
                  <div
                    className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 5 ? 'font-bold underline' : ''}`}
                    onClick={() => handleRatingFilterClick(5)}
                  >
                    5 Star ({bookStats.items[0].star_5})
                  </div>
                  <div
                    className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 4 ? 'font-bold underline' : ''}`}
                    onClick={() => handleRatingFilterClick(4)}
                  >
                    4 Star ({bookStats.items[0].star_4})
                  </div>
                  <div
                    className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 3 ? 'font-bold underline' : ''}`}
                    onClick={() => handleRatingFilterClick(3)}
                  >
                    3 Star ({bookStats.items[0].star_3})
                  </div>
                  <div
                    className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 2 ? 'font-bold underline' : ''}`}
                    onClick={() => handleRatingFilterClick(2)}
                  >
                    2 Star ({bookStats.items[0].star_2})
                  </div>
                  <div
                    className={`px-2 hover:underline cursor-pointer ${activeRatingFilter === 1 ? 'font-bold underline' : ''}`}
                    onClick={() => handleRatingFilterClick(1)}
                  >
                    1 Star ({bookStats.items[0].star_1})
                  </div>
                </div>
              </div>
            )}

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
