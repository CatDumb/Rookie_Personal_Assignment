// src/api/books.ts
import api from "./client";

export interface BookDetailResponse {
  book: {
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
}

export function getBookDetails(bookId: number) {
  return api.get<BookDetailResponse>(`api/book/${bookId}`)
    .then(res => {
      return res.data;
    });
}
