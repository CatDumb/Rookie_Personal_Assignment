// src/api/books.ts
import api from "./client";

export interface BookDetailResponse {
  book: {
    id: number;
    name: string;
    author: string;
    price: number;
    discount_price: number | null;
    cover_photo: string | null;  // Allow null values
    summary: string;
    average_rating: number;
    review_count: number;
    category: string;
  }
}

export function getBookDetails(bookId: number) {
  return api.get<BookDetailResponse>(`api/book/${bookId}`)
    .then(res => {
      // Ensure cover_photo is never null
      if (res.data && res.data.book) {
        res.data.book.cover_photo = res.data.book.cover_photo || "/book.png";
      }
      return res.data;
    });
}
