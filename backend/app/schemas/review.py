"""
Review-related Pydantic schemas for API request/response handling.

This module defines the data models for book review operations including
creating reviews, retrieving paginated reviews, and filtering reviews
by various criteria.
"""

from datetime import datetime
from typing import Optional

from app.schemas.base import PaginatedResponse
from pydantic import BaseModel, Field


# ----- Base Schema -----
class ReviewBase(BaseModel):
    """
    Base schema with common review attributes.

    This class serves as the foundation for review-related schemas,
    containing fields that represent a book review.

    Attributes:
        book_id: ID of the book being reviewed
        review_title: Optional title/headline for the review
        review_details: Optional detailed text content of the review
        rating_star: Star rating from 1-5 (1 lowest, 5 highest)
        review_date: Optional timestamp of when the review was created
    """

    book_id: int
    review_title: Optional[str] = None
    review_details: Optional[str] = None
    rating_star: int = Field(..., ge=1, le=5)  # Rating must be between 1 and 5
    review_date: Optional[datetime] = None  # Handled by server on creation


# ----- Request Schema (for creating) -----
class ReviewPostRequest(ReviewBase):
    """
    Schema for creating a new book review.

    Extends ReviewBase with default review date handling.

    Attributes:
        review_date: Timestamp for the review, defaults to current time if not provided
    """

    # Inherits fields from ReviewBase
    # review_date might be set by client or server, keep optional here
    review_date: Optional[datetime] = Field(default_factory=datetime.now)


# Match the response model name used in the route
class ReviewPostResponse(ReviewBase):
    """
    Schema for review creation response.

    Currently inherits all fields from ReviewBase without modifications.
    """

    # Inherits all fields from ReviewRead
    pass


class PaginatedReviewsResponse(PaginatedResponse[ReviewBase]):
    """
    Response schema for paginated book reviews.

    Provides review information with pagination metadata.
    """

    pass


class ReviewFilterRequest(BaseModel):
    """
    Request schema for filtering and paginating book reviews.

    Provides parameters for specifying which book's reviews to retrieve,
    pagination settings, optional rating filter, and sort order.

    Attributes:
        book_id: ID of the book to get reviews for
        page: Page number for pagination (starts at 1)
        per_page: Number of reviews per page (limited to specific values)
        rating: Optional filter to only show reviews with specific rating
        sort_order: How to sort reviews ('newest' or 'oldest')
    """

    book_id: int = Field(..., description="Book ID")
    page: int = Field(1, ge=1, description="Page number")
    per_page: int = Field(5, description="Items per page", enum=[5, 15, 20, 25])
    rating: Optional[int] = Field(
        None,
        ge=1,
        le=5,
        description="Filter by rating star (1-5)",
    )
    sort_order: str = Field("newest", description="Sort order: 'newest' or 'oldest'")
