import api from "./client";

export interface ReviewResponse {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewRequest {
  book_id: number;
  review_title: string;
  rating_star: number;
  review_details: string;
}

export function postReview(review: ReviewRequest) {
  return api.post<ReviewResponse>(`api/review/book/${review.book_id}`, review)
    .then(res => {
      return res.data;
    });
}
