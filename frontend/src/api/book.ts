// src/api/book.ts
import api from "./client";

// ----- INTERFACES -----

// Base interface for common book properties
export interface BaseBook {
  id: number;
  book_title: string;
  author: string;
  book_price: number;
  discount_price: number | null;
  book_cover_photo: string | null;
}

// Extended interface for Book Details
export interface BookDetail extends BaseBook {
  book_summary: string;
  avg_rating: number;
  review_count: number;
  category: string;
}

export interface BookDetailResponse {
  book: BookDetail;
}

// Extended interface for On Sale items
export interface OnSaleItem extends BaseBook {
  discount_amount: number | null;
}

export interface OnSaleResponse {
  items: OnSaleItem[];
}

// Extended interface for Recommendations
export interface RecommendResponse extends BaseBook {
  avg_rating: number;
  review_count: number;
}

// Extended interface for Popular books
export interface PopularResponse extends BaseBook {
  review_count?: number; // Optional field for popular books
}

// ----- API FUNCTIONS -----

// From original book.ts
export function getBookDetails(bookId: number) {
  return api.get<BookDetailResponse>(`api/book/${bookId}`)
    .then(res => {
      // Ensure book_cover_photo is never null
      if (res.data && res.data.book) {
        console.log('Book details - Cover photo before:', res.data.book.book_cover_photo);

        // Set a fallback for book_cover_photo
        res.data.book.book_cover_photo = res.data.book.book_cover_photo || "/book.png";

        // For backward compatibility with components that use the old field names
        // Add legacy field names to the book object as the codebase transitions
        const bookWithLegacyFields = res.data.book as BookDetail & {
          cover_photo: string;
          price: number;
          average_rating: number;
          summary: string;
        };

        // Set compatibility fields for components still using old names
        bookWithLegacyFields.cover_photo = res.data.book.book_cover_photo;
        bookWithLegacyFields.price = res.data.book.book_price;
        bookWithLegacyFields.average_rating = res.data.book.avg_rating;
        bookWithLegacyFields.summary = res.data.book.book_summary;

        console.log('Book details - Cover photo after:', res.data.book.book_cover_photo);
      }
      return res.data;
    });
}

// From onsale.ts
export function getOnSale() {
  return api.get<OnSaleResponse>("api/book/on_sale")
    .then(res => {
      if (res.data && res.data.items && Array.isArray(res.data.items)) {
        return res.data.items.map(item => ({
          id: item.id,
          book_title: item.book_title,
          author: item.author,
          book_price: item.book_price,
          discount_price: item.discount_price,
          book_cover_photo: item.book_cover_photo || "/book.png",
          discount_amount: item.discount_amount || 0,
        }));
      }
      console.error("Unexpected response structure for on sale:", res.data);
      return [];
    });
}

// From recommend.ts
export function getRecommendations() {
  return api.get<{ items: RecommendResponse[] }>("api/book/featured/recommended")
    .then(res => {
      if (res.data && res.data.items && Array.isArray(res.data.items)) {
        return res.data.items.map(item => ({
          id: item.id,
          book_title: item.book_title,
          author: item.author,
          book_price: item.book_price,
          discount_price: item.discount_price,
          book_cover_photo: item.book_cover_photo,
          avg_rating: item.avg_rating,
          review_count: item.review_count || 0
        }));
      }
      console.error("Unexpected response structure for recommendations:", res.data);
      return [];
    });
}

// From recommend.ts
export function getPopular() {
  return api.get<{ items: PopularResponse[] }>("api/book/featured/popular")
    .then(res => {
      if (res.data && res.data.items && Array.isArray(res.data.items)) {
        return res.data.items.map(item => ({
          id: item.id,
          book_title: item.book_title,
          author: item.author,
          book_price: item.book_price,
          discount_price: item.discount_price,
          book_cover_photo: item.book_cover_photo,
          review_count: item.review_count
        }));
      }
      console.error("Unexpected response structure for popular:", res.data);
      return [];
    });
}
