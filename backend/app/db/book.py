"""
Book database model for storing book information.

This module defines the SQLModel for the Book table, which represents
books in the bookstore with their properties, prices, and relationships
to authors and categories.
"""

from typing import Optional

from sqlalchemy import BigInteger, Numeric
from sqlmodel import Field

from .base import Base


class Book(Base, table=True):
    """
    Database model representing a book in the bookstore.

    Each book has a title, price, optional cover photo, and relationships
    to an author and a category. Books can be discounted and ordered by users.

    Attributes:
        id: Unique identifier for the book
        category_id: Foreign key to the book's category
        author_id: Foreign key to the book's author
        book_title: Title of the book (max 255 characters)
        book_summary: Description or summary of the book's content
        book_price: Retail price of the book (numeric with 2 decimal places)
        book_cover_photo: Optional filename of the book's cover image
    """

    __tablename__ = "book"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)

    category_id: int = Field(
        default=None,
        foreign_key="category.id",
        sa_type=BigInteger,
    )
    author_id: int = Field(default=None, foreign_key="author.id", sa_type=BigInteger)
    book_title: str = Field(default=None, max_length=255)
    book_summary: str = Field(default=None)
    book_price: float = Field(default=None, sa_type=Numeric(5, 2))
    book_cover_photo: Optional[str] = Field(default=None, max_length=40)
