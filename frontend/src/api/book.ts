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
  console.log(`Fetching book details for ID: ${bookId}`);
  // Ensure we use /api prefix for proper proxying
  return api.get<BookDetailResponse>(`/api/book/${bookId}`)
    .then(res => {
      console.log('Book details API response:', res.data);

      // Check if we have a valid response
      if (!res.data) {
        console.error('Empty response from book details API');
        throw new Error('No data received from server');
      }

      // Check if book property exists in the response
      if (!res.data.book) {
        console.error('Book property missing in API response:', res.data);
        throw new Error('Book data not found in response');
      }

      // Ensure book_cover_photo is never null
      res.data.book.book_cover_photo = res.data.book.book_cover_photo || "/book.png";
      console.log('Book details - Cover photo after processing:', res.data.book.book_cover_photo);

      // For backward compatibility with components that use the old field names
      // Add legacy field names to the book object as the codebase transitions
      const bookWithLegacyFields = res.data.book as BookDetail & {
        cover_photo: string;
        price: number;
        average_rating: number;
        summary: string;
        name?: string; // Add name field for compatibility
      };

      // Set compatibility fields for components still using old names
      bookWithLegacyFields.cover_photo = res.data.book.book_cover_photo;
      bookWithLegacyFields.price = res.data.book.book_price;
      bookWithLegacyFields.average_rating = res.data.book.avg_rating;
      bookWithLegacyFields.summary = res.data.book.book_summary;
      bookWithLegacyFields.name = res.data.book.book_title; // Add name field for compatibility

      return res.data;
    })
    .catch(error => {
      console.error('Error fetching book details:', error);
      throw error;
    });
}

// From onsale.ts
export function getOnSale() {
  return api.get<OnSaleResponse>("/api/book/on_sale")
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
  return api.get<{ items: RecommendResponse[] }>("/api/book/featured/recommended")
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
  return api.get<{ items: PopularResponse[] }>("/api/book/featured/popular")
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
