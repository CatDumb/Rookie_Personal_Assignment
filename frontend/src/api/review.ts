import api from "./client";

export interface ReviewPostResponse {
  id: number;
  book_id: number;
  user_id: number;
  rating_star: number;
  review_date: string;
  review_title: string;
  review_details: string | null;
}

export interface ReviewPostRequest {
  book_id: number;
  rating_star: number;
  review_title: string;
  review_details?: string;
}

export interface ReviewFilterRequest {
  book_id: number;
  page?: number;
  per_page?: number;
  sort_order?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating';
  rating?: number;
}

export interface ReviewUpdateRequest {
  rating_star?: number;
  review_title?: string;
  review_details?: string;
}

export interface ReviewResponse {
  id: number;
  book_id: number;
  user_id: number;
  rating_star: number;
  review_date: string;
  review_title: string;
  review_details: string | null;
}

export interface ReviewsResponse {
  items: ReviewPostResponse[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export function getReviews(filters: ReviewFilterRequest) {
  // Build query params
  const queryParams = new URLSearchParams();
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.per_page) queryParams.append('per_page', filters.per_page.toString());
  if (filters.sort_order) queryParams.append('sort_order', filters.sort_order);
  if (filters.rating) queryParams.append('rating', filters.rating.toString());

  // Construct URL with query params
  const url = `/api/review/book/${filters.book_id}?${queryParams.toString()}`;

  return api.get<ReviewsResponse>(url)
    .then(res => res.data);
}

export function postReview(reviewData: ReviewPostRequest) {
  return api.post<ReviewPostResponse>('/api/review/book', reviewData)
    .then(res => res.data);
}

export function updateReview(reviewId: number, reviewData: ReviewUpdateRequest) {
  return api.put<ReviewResponse>(`/api/review/${reviewId}`, reviewData)
    .then(res => res.data);
}

export function deleteReview(reviewId: number) {
  return api.delete<void>(`/api/review/${reviewId}`)
    .then(res => res.data);
}

export interface BookStats {
  review_count: number;
  avg_rating: number;
  star_5: number;
  star_4: number;
  star_3: number;
  star_2: number;
  star_1: number;
}

export interface BookStatsResponse {
  items: BookStats[];
}

export function getBookStats(book_id: number) {
  return api.get<BookStatsResponse>(`/api/review/book/${book_id}/stats`)
    .then(res => {
      console.log("Book stats API response:", res.data);
      return res.data;
    })
    .catch(error => {
      console.error("Error fetching book stats:", error);
      // Return a default empty response to prevent UI errors
      return { items: [] } as BookStatsResponse;
    });
}
