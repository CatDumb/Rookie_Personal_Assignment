from datetime import datetime
from typing import Optional

from app.schemas.base import PaginatedResponse
from pydantic import BaseModel, Field


# ----- Base Schema -----
class ReviewBase(BaseModel):
    book_id: int
    review_title: Optional[str] = None
    review_details: Optional[str] = None
    rating_star: int = Field(..., ge=1, le=5)  # Rating must be between 1 and 5
    review_date: Optional[datetime] = None  # Handled by server on creation


# ----- Request Schema (for creating) -----
class ReviewPostRequest(ReviewBase):
    # Inherits fields from ReviewBase
    # review_date might be set by client or server, keep optional here
    review_date: Optional[datetime] = Field(default_factory=datetime.now)


# Match the response model name used in the route
class ReviewPostResponse(ReviewBase):
    # Inherits all fields from ReviewRead
    pass


class PaginatedReviewsResponse(PaginatedResponse[ReviewBase]):
    pass


class ReviewFilterRequest(BaseModel):
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
