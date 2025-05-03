// src/Page/BookDetails.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookHeader } from '../components/Header/BookHeader';
import { Button } from '../components/ui/button';
import { ReviewForm } from '../components/ui/reviewForm';
import { ReviewItem } from '../components/ui/reviewItem';
import { Star } from 'lucide-react';
import { useAuth } from '@/components/Context/AuthContext';
import { QuantitySelector } from '@/components/ui/quantitySelector';
import { dispatchCartUpdateEvent } from '@/components/Context/CartContext';
import { useBookDetails } from '@/hooks/useBookDetails';
import { usePagination } from '@/hooks/usePagination';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// ----- TYPES & INTERFACES -----
interface Review {
  id: number;
  title: string;
  author: string;
  date: string;
  rating: number;
  content: string;
}

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;

  const { book, loading: bookLoading, error: bookError } = useBookDetails(numericId);

  const [quantity, setQuantity] = useState(1);
  const { isLoggedIn } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);

  const {
    currentPage,
    totalPages,
    paginatedData: currentReviews,
    handlePageChange,
    nextPage,
    prevPage
  } = usePagination({
    data: reviews,
    itemsPerPage: 3
  });

  useEffect(() => {
    if (book) {
        const dummyReviews = generateDummyReviews(book.review_count || 12);
        setReviews(dummyReviews);
    } else {
        setReviews([]);
    }
  }, [book]);

  /* EVENT HANDLERS */
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

  /* UTILITY FUNCTIONS */
  const generateDummyReviews = (count: number): Review[] => {
    const dummyReviews: Review[] = [];
    const reviewContents = [
      "This book was amazing! I couldn't put it down.",
      "A wonderful read that kept me engaged from start to finish.",
      "The author's writing style is captivating and the story flows well.",
      "I found the characters to be well-developed and relatable.",
      "A bit slow at times, but overall a solid book.",
      "Not what I expected, but pleasantly surprised by the ending.",
      "The plot twists in this book were unexpected and exciting!",
      "I enjoyed the author's perspective on the subject matter.",
      "Would definitely recommend to friends looking for a good read.",
      "I'll be looking for more books by this author in the future."
    ];
    const names = ["John D.", "Sarah M.", "Robert K.", "Emily L.", "Michael P.", "Jennifer S.", "David W.", "Amanda C.", "James T.", "Lisa B."];
    for (let i = 1; i <= count; i++) {
      const randomRating = Math.floor(Math.random() * 5) + 1;
      const randomContent = reviewContents[i % reviewContents.length];
      const randomName = names[i % names.length];
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - (i * 3));
      dummyReviews.push({
        id: i,
        title: `Review ${i}`,
        author: randomName,
        date: randomDate.toISOString(),
        rating: randomRating,
        content: randomContent
      });
    }
    return dummyReviews;
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

  console.log("Book data:", book);

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
                {book.cover_photo ? (
                  <img
                    src={book.cover_photo}
                    alt={book.name}
                    className="w-full h-auto object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/book.png";
                    }}
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
              <p className='font-bold text-xl md:text-2xl mb-3'>{book.name}</p>
              <p className='text-left'>{book.summary}</p>
            </div>
          </div>
        </div>

        {/* PURCHASE BOX */}
        <div className="w-full lg:w-[30%] border-2 border-gray-400 rounded-lg flex flex-col relative mt-4 lg:mt-0 lg:h-fit">
          {/* PRICE DISPLAY */}
          <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-200 rounded-t-lg">
            <span className={book.discount_price ? "text-md line-through" : "text-2xl text-black font-bold break-words"}>
              ${book.price}
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
            <div className='font-bold text-2xl'>
              Customer Reviews
            </div>

            {/* RATING SUMMARY */}
            <div className='font-bold text-2xl flex items-center gap-2'>
              <span>{book.average_rating}</span>
              <div className="flex">
                {Array(5).fill(0).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${index < Math.round(book.average_rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-base font-normal ml-2">({reviews.length} reviews)</span>
            </div>

            {/* REVIEW ITEMS */}
            <div className="mt-4">
              {currentReviews.length > 0 ? (
                currentReviews.map(review => (
                  <ReviewItem
                    key={review.id}
                    title={review.title}
                    author={review.author}
                    date={review.date}
                    rating={review.rating}
                    content={review.content}
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
