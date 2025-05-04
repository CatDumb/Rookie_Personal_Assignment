"""
Discount database model for storing book discount information.

This module defines the SQLModel for the Discount table, which represents
temporary price reductions for books with specific start and end dates.
"""

from sqlalchemy import BigInteger, Date, Numeric
from sqlmodel import Field

from .base import Base


class Discount(Base, table=True):
    """
    Database model representing a temporary discount on a book.

    Each discount record is associated with a specific book and has a
    time-limited validity period defined by start and end dates.
    Discounts are used for promotions and sales events.

    Attributes:
        id: Unique identifier for the discount
        book_id: Foreign key to the book receiving the discount
        discount_start_date: Date when the discount becomes active
        discount_end_date: Date when the discount expires
        discount_price: Discounted price of the book (5 digits, 2 decimal places)
    """

    __tablename__ = "discount"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    book_id: int = Field(default=None, foreign_key="book.id", sa_type=BigInteger)
    discount_start_date: str = Field(default=None, sa_type=Date)
    discount_end_date: str = Field(default=None, sa_type=Date)
    discount_price: float = Field(default=None, sa_type=Numeric(5, 2))
