import api from "./client";

export interface ReviewPostResponse {
  book_id: number;
  review_title: string;
  review_details?: string;
  review_date: string;
  rating_star: number;
}

export interface ReviewPostRequest {
  book_id: number;
  review_title: string;
  rating_star: number;
  review_details?: string;
}


export interface PaginatedReviewsResponse {
  items: ReviewPostResponse[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}


export function postReview(review: ReviewPostRequest) {
  return api.post<ReviewPostResponse>(`api/review/book/${review.book_id}`, review)
    .then(res => {
      return res.data;
    });
}

export interface ReviewFilterRequest {
  book_id: number;
  page?: number; // Make optional with default 1
  per_page?: number; // Make optional with default 5
  rating?: number; // Make optional
  sort_order: 'newest' | 'oldest'; // Add literal type
}

export function getReviews(filters: ReviewFilterRequest) {
  // Build query parameters, only including rating if it's a valid number
  const queryParams = new URLSearchParams({
    page: filters.page?.toString() || '1',
    per_page: filters.per_page?.toString() || '5',
    sort_order: filters.sort_order
  });

  // Only add rating if it's a valid number between 1 and 5
  if (filters.rating && filters.rating >= 1 && filters.rating <= 5) {
    queryParams.append('rating', filters.rating.toString());
  }

  return api.get<PaginatedReviewsResponse>(`api/review/book/${filters.book_id}?${queryParams.toString()}`)
    .then(res => {
      return res.data;
    });
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
  return api.get<BookStatsResponse>(`api/review/book/${book_id}/stats`)
    .then(res => {
      return res.data;
    });
}
