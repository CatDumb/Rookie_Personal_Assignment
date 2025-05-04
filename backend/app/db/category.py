"""
Category database model for storing book category information.

This module defines the SQLModel for the Category table, which represents
book categories or genres in the bookstore with their names and descriptions.
"""

from sqlalchemy import BigInteger
from sqlmodel import Field

from .base import Base


class Category(Base, table=True):
    """
    Database model representing a book category or genre in the bookstore.

    Categories are used to classify books and allow for filtering
    of the book catalog by subject area or literary genre.

    Attributes:
        id: Unique identifier for the category
        category_name: Name of the category/genre (max 120 characters)
        category_desc: Description of the category (max 255 characters)
    """

    __tablename__ = "category"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    category_name: str = Field(default=None, max_length=120)
    category_desc: str = Field(default=None, max_length=255)
