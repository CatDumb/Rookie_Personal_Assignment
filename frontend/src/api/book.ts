// src/api/book.ts
import api from "./client";

// ----- INTERFACES -----

// Base interface for common book properties
export interface BaseBook {
  id: number;
  name: string;
  author: string;
  price: number;
  discount_price: number | null;
  cover_photo: string | null; // Use string | null for broader compatibility
}

// Extended interface for Book Details
export interface BookDetail extends BaseBook {
  summary: string;
  average_rating: number;
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
// Note: API might guarantee non-null cover_photo here, but BaseBook allows null
export interface RecommendResponse extends BaseBook {
  average_rating: number;
  total_reviews: number;
}

// Extended interface for Popular books
// Note: API might guarantee non-null cover_photo here, but BaseBook allows null
export interface PopularResponse extends BaseBook {
  review_count?: number; // Optional field for popular books
}

// ----- API FUNCTIONS -----

// From original book.ts
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

// From onsale.ts
export function getOnSale() {
  return api.get<OnSaleResponse>("api/book/on_sale")
    .then(res => {
      if (res.data && res.data.items && Array.isArray(res.data.items)) {
        return res.data.items.map(item => ({
          id: item.id,
          name: item.name,
          author: item.author,
          price: item.price,
          discount_price: item.discount_price,
          cover_photo: item.cover_photo || "/book.png",
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
          name: item.name,
          author: item.author,
          price: item.price,
          discount_price: item.discount_price,
          cover_photo: item.cover_photo,
          average_rating: item.average_rating,
          total_reviews: item.total_reviews || 0 // Ensure we always have a value
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
          name: item.name,
          author: item.author,
          price: item.price,
          discount_price: item.discount_price,
          cover_photo: item.cover_photo,
          review_count: item.review_count
        }));
      }
      console.error("Unexpected response structure for popular:", res.data);
      return [];
    });
}
