from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ----- Base Schema -----
class ReviewBase(BaseModel):
    book_id: int
    review_title: Optional[str] = None
    review_details: Optional[str] = None
    rating_star: int = Field(..., ge=1, le=5)  # Rating must be between 1 and 5
    review_date: Optional[datetime] = None  # Handled by server on creation


# ----- Request Schema (for creating) -----
class ReviewRequest(ReviewBase):
    # Inherits fields from ReviewBase
    # review_date might be set by client or server, keep optional here
    review_date: Optional[datetime] = Field(default_factory=datetime.now)


# ----- Response/Read Schema -----
class ReviewRead(ReviewBase):
    id: int  # Add review ID
    # review_date is definitely set when reading
    review_date: datetime

    class Config:
        from_attributes = True


# Match the response model name used in the route
class ReviewResponse(ReviewRead):
    # Inherits all fields from ReviewRead
    pass
