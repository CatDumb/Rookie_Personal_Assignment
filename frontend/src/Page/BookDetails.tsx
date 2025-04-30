// src/Page/BookDetails.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBookDetails } from '../api/book';
import { BookHeader } from '../components/Header/BookHeader';
import { Button } from '../components/ui/button';
import { ReviewForm } from '../components/ui/reviewForm';
import { ReviewItem } from '../components/ui/reviewItem';
import { Star } from 'lucide-react';

import { Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
 } from '@/components/ui/pagination';

// ----- TYPES & INTERFACES -----
interface BookDetailsData {
  id: number;
  name: string;
  author: string;
  price: number;
  discount_price: number | null;
  cover_photo: string | null;  // Updated to allow null values
  summary: string;
  average_rating: number;
  review_count: number;
  category: string;
}

interface Review {
  id: number;
  title: string;
  author: string;
  date: string;
  rating: number;
  content: string;
}

const BookDetails = () => {
  // ----- STATE MANAGEMENT -----
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [reviews, setReviews] = useState<Review[]>([]);

  // ----- EVENT HANDLERS -----
  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ----- DATA FETCHING -----
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError('');

    getBookDetails(parseInt(id))
      .then((data) => {
        setBook(data.book);
        setLoading(false);

        // Create dummy reviews based on the book's review count
        const dummyReviews = generateDummyReviews(data.book.review_count || 12);
        setReviews(dummyReviews);
      })
      .catch((err) => {
        console.error("Error fetching book details:", err);
        setError("Failed to load book details");
        setLoading(false);
      });
  }, [id]);

  // Generate dummy reviews
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
      randomDate.setDate(randomDate.getDate() - (i * 3)); // Different dates going backward

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

  // Calculate pagination
  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = reviews.slice(indexOfFirstItem, indexOfLastItem);

  // ----- CONDITIONAL RENDERING -----
  if (loading) {
    return <div className="text-center py-20">Loading book details...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  if (!book) {
    return <div className="text-center py-20">Book not found</div>;
  }

  // ----- MAIN RENDER -----
  return (
    <div>
      {/* ----- BOOK INFORMATION SECTION ----- */}
      <div>
        <BookHeader text={book.category} />
        <div className="flex flex-col lg:flex-row gap-4 lg:justify-between">
          {/* Book Details Card */}
          <div className="w-full lg:w-[68%] border border-gray-400 rounded-lg flex flex-col relative p-4">
            <div className='flex flex-col md:flex-row gap-6'>
              {/* Book Cover and Author */}
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

              {/* Book Title and Summary */}
              <div className='w-full md:w-[50%] mt-4 md:mt-0'>
                <p className='font-bold text-xl md:text-2xl mb-3'>{book.name}</p>
                <p className='text-left'>{book.summary}</p>
              </div>
            </div>
          </div>

          {/* ----- PURCHASE SECTION ----- */}
          <div className="w-full lg:w-[30%] border border-gray-400 rounded-lg flex flex-col relative mt-4 lg:mt-0 lg:h-fit">
            {/* Price Display */}
            <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-200 rounded-t-lg">
              {book.discount_price && <span className="text-md line-through">${book.price}</span>}
              <span className="text-2xl text-black font-bold break-words">
                ${book.discount_price || book.price}
              </span>
            </div>
            {/* Quantity Selection and Add to Cart */}
            <div className='flex flex-col gap-4 p-4'>
              <div>
                <label className="block mb-2">Quantity</label>
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-r border-gray-300"
                    onClick={decrementQuantity}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="w-full p-2 text-center outline-none"
                    value={quantity}
                    readOnly
                  />
                  <button
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-l border-gray-300"
                    onClick={incrementQuantity}
                  >
                    +
                  </button>
                </div>
              </div>
              <Button className="w-full">Add to cart</Button>
            </div>
          </div>
        </div>
      </div>

      {/* ----- REVIEWS SECTION ----- */}
      <div className="flex flex-col lg:flex-row gap-4 lg:justify-between pt-4">
        <div className="w-full lg:w-[68%] px-3 py-2 bg-gray-100 text-gray-700 border-l border-gray-300 rounded-lg">
          <div className='flex flex-col gap-4 px-4 py-8'>
            <div className='font-bold text-2xl'>
              Customer Reviews
            </div>
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

            {/* Review Items */}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-6">
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
            )}
          </div>
        </div>
        <div className='w-full lg:w-[30%]'>
          <ReviewForm book_id={parseInt(id || '0')} />
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
