from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ReviewBase(BaseModel):
    """Base class for review data"""

    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    book_id: int  # Use Python int instead of SQLAlchemy BigInteger
    review_title: str
    review_details: str
    review_date: datetime
    rating_star: int


class ReviewRequest(ReviewBase):
    """Request model for creating a review"""

    pass


class ReviewResponse(ReviewBase):
    """Response model for reviews"""

    id: int
