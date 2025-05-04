"""
Book statistics database model for storing aggregated book metrics.

This module defines the SQLModel for the BookStats table, which stores
pre-calculated statistics for books including review counts, ratings, and pricing.
"""

from sqlalchemy import BigInteger, Float, Integer
from sqlmodel import Field

from .base import Base


class BookStats(Base, table=True):
    """
    Database model for storing pre-calculated statistics for a book.

    These statistics are updated whenever a new review is added or
    book prices change, providing quick access to aggregate data without
    needing to recalculate from reviews and discounts on each request.

    Attributes:
        id: Foreign key to the book (same as book ID)
        review_count: Total number of reviews for the book
        total_star: Sum of all star ratings received
        avg_rating: Average star rating (total_star / review_count)
        lowest_price: Current lowest available price (considering discounts)
    """

    __tablename__ = "book_stats"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    review_count: int = Field(default=0, sa_type=Integer)
    total_star: int = Field(default=0, sa_type=Integer)
    avg_rating: float = Field(default=0.0, sa_type=Float)
    lowest_price: float = Field(default=0.0, sa_type=Float)
