"""
Review database model for storing book review information.

This module defines the SQLModel for the Review table, which represents
customer reviews and ratings for books in the bookstore.
"""

from typing import Optional

from sqlalchemy import TIMESTAMP, BigInteger
from sqlmodel import Field

from .base import Base


class Review(Base, table=True):
    """
    Database model representing a customer review for a book.

    Reviews include a title, detailed text content, date, and star rating.
    These reviews help customers make informed purchasing decisions and
    contribute to book statistics and recommendations.

    Attributes:
        id: Unique identifier for the review
        book_id: Foreign key to the book being reviewed
        review_title: Title/headline of the review (max 120 characters)
        review_details: Optional detailed text content of the review
        review_date: Timestamp when the review was submitted
        rating_star: Star rating from 1-5 (1 being lowest, 5 being highest)
    """

    __tablename__ = "review"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    book_id: int = Field(default=None, foreign_key="book.id", sa_type=BigInteger)
    review_title: str = Field(default=None, max_length=120)
    review_details: Optional[str] = Field(default=None)
    review_date: str = Field(default=None, sa_type=TIMESTAMP)
    rating_star: int = Field(default=None, le=5, ge=1)  # Range 1-5, 5 being highest
