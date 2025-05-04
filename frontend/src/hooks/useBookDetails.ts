/* Book Details Hook - Fetches and manages book information from the API */
import { useState, useEffect } from 'react';
import { getBookDetails, BookDetail, BookDetailResponse } from '../api/book';

/**
 * Custom hook to fetch and manage book details data
 * @param bookId The ID of the book to fetch details for
 * @returns Object containing book data, loading state, and error information
 */
export const useBookDetails = (bookId: number | null) => {
  /* State Management */
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  /* Data Fetching Effect */
  useEffect(() => {
    // Only fetch if bookId is a valid number
    if (typeof bookId !== 'number' || isNaN(bookId)) {
      setError('Invalid book ID.');
      setLoading(false);
      setBook(null);
      return;
    }

    // Reset states before fetching
    setLoading(true);
    setError('');
    setBook(null); // Reset book state on new ID

    console.log(`useBookDetails: Fetching details for book ID ${bookId}`);

    /* API Call to Get Book Details */
    getBookDetails(bookId)
      .then((data: BookDetailResponse) => {
        console.log(`useBookDetails: Successfully received data for book ID ${bookId}`, data);
        if (data && data.book) {
            setBook(data.book);
        } else {
            console.error(`useBookDetails: Book data missing in response for ID ${bookId}`, data);
            setError("Book data not found in response.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(`useBookDetails: Error fetching book details for ID ${bookId}:`, err);
        setError(err?.message || "Failed to load book details");
        setLoading(false);
      });

  }, [bookId]); // Re-run effect if bookId changes

  /* Return Hook Values */
  return { book, loading, error };
};
