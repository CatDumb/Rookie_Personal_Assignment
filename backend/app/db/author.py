"""
Author database model for storing book author information.

This module defines the SQLModel for the Author table, which represents
book authors with their names and biographical information.
"""

from sqlalchemy import BigInteger
from sqlmodel import Field

from .base import Base


class Author(Base, table=True):
    """
    Database model representing a book author in the bookstore.

    Authors are associated with books and can have multiple books
    in the catalog. Their biographical information helps customers
    learn about the creators of the books.

    Attributes:
        id: Unique identifier for the author
        author_name: Full name of the author (max 255 characters)
        author_bio: Biographical text about the author
    """

    __tablename__ = "author"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    author_name: str = Field(default=None, max_length=255)
    author_bio: str = Field(default=None)
