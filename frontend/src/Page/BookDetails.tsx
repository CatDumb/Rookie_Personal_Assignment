// src/Page/BookDetails.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBookDetails } from '../api/book';
import { BookHeader } from '../components/Header/BookHeader';
import { Button } from '../components/ui/button';
import { ReviewForm } from '../components/ui/ReviewForm';

interface BookDetailsData {
  id: number;
  name: string;
  author: string;
  price: number;
  discount_price: number | null;
  cover_photo: string;
  summary: string;
  average_rating: number;
  review_count: number;
  category: string;
}

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError('');

    getBookDetails(parseInt(id))
      .then((data) => {
        setBook(data.book);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching book details:", err);
        setError("Failed to load book details");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="text-center py-20">Loading book details...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  if (!book) {
    return <div className="text-center py-20">Book not found</div>;
  }

  return (
    <div>
      <div>
        <BookHeader text={book.category} />
        <div className="flex flex-col lg:flex-row gap-4 lg:justify-between">
          <div className="w-full lg:w-[68%] border border-gray-400 rounded-lg flex flex-col relative p-4">
            <div className='flex flex-col md:flex-row gap-6'>
              <div className='w-full md:w-[30%] flex flex-col'>
                <div className="max-w-[300px] mx-auto md:mx-0">
                  {book.cover_photo ? (
                    <img
                      src={book.cover_photo}
                      alt={book.name}
                      className="w-full h-auto object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.onerror = null; // Prevent infinite loop
                        e.currentTarget.src = "/book.png"; // Fallback image
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

              <div className='w-full md:w-[50%] mt-4 md:mt-0'>
                <p className='font-bold text-xl md:text-2xl mb-3'>{book.name}</p>
                <p className='text-left'>{book.summary}</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[30%] border border-gray-400 rounded-lg flex flex-col relative mt-4 lg:mt-0 lg:h-fit">
            <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-200 rounded-t-lg">
              {book.price && <span className="text-md line-through">${book.price}</span>}
              <span className="text-2xl text-black font-bold break-words">${book.discount_price}</span>
            </div>
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
      <div className="flex flex-col lg:flex-row gap-4 lg:justify-between pt-4">
        <div className="w-full lg:w-[68%] text-xl font-bold mb-4">Reviews section</div>
        <div className='w-full lg:w-[30%]'>
          <ReviewForm bookId={parseInt(id || '0')} />
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
