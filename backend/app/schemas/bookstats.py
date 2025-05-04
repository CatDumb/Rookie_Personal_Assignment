"""
Book statistics Pydantic schemas for API request/response handling.

This module defines the data models for book statistics operations,
including retrieval of aggregated review counts and ratings distribution.
"""

from app.schemas.base import ItemsResponse
from pydantic import BaseModel


# ----- Schema for Book Stats -----
class BookStats(BaseModel):
    """
    Schema representing aggregated statistics for a book.

    Includes overall review metrics and a breakdown of ratings by star level,
    allowing for detailed review distribution information.

    Attributes:
        review_count: Total number of reviews for the book
        avg_rating: Average star rating (typically 0-5)
        star_5: Number of 5-star reviews
        star_4: Number of 4-star reviews
        star_3: Number of 3-star reviews
        star_2: Number of 2-star reviews
        star_1: Number of 1-star reviews
    """

    review_count: int
    avg_rating: float
    star_5: int
    star_4: int
    star_3: int
    star_2: int
    star_1: int


class BookStatsResponse(ItemsResponse[BookStats]):
    """
    Response schema for book statistics.

    Wraps BookStats in the standard items response format
    for consistent API response structure.
    """

    pass
