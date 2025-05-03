import { useState, useEffect } from 'react';
import { getBookDetails, BookDetail } from '../api/book';

export const useBookDetails = (bookId: number | null) => {
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Only fetch if bookId is a valid number
    if (typeof bookId !== 'number' || isNaN(bookId)) {
      setError('Invalid book ID.');
      setLoading(false);
      setBook(null);
      return;
    }

    setLoading(true);
    setError('');
    setBook(null); // Reset book state on new ID

    getBookDetails(bookId)
      .then((data) => {
        if (data && data.book) {
            setBook(data.book);
        } else {
            setError("Book data not found in response.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching book details:", err);
        setError("Failed to load book details");
        setLoading(false);
      });

  }, [bookId]); // Re-run effect if bookId changes

  return { book, loading, error };
};
