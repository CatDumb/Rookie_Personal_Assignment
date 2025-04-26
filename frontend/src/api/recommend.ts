import api from "./client";

export interface RecommendResponse {
  id: number;
  name: string;
  author: string;
  price: number;
  discount_price: number | null;
  cover_photo: string;
  average_rating: number;
  total_reviews: number; // This field is required but might be missing in API response
}

export interface PopularResponse {
  id: number;
  name: string;
  author: string;
  price: number;
  discount_price: number | null;
  cover_photo: string;
  review_count?: number; // Optional field for popular books
}

// Fixed to correctly map all required fields including total_reviews
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
      console.error("Unexpected response structure:", res.data);
      return [];
    });
}

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
      console.error("Unexpected response structure:", res.data);
      return [];
    });
}
