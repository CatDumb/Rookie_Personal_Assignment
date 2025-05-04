"""
Category-related Pydantic schemas for API request/response handling.

This module defines the data models for book category operations including
category retrieval and potential future operations like creation.
"""

from typing import Optional

from pydantic import BaseModel


# ----- Base Schema -----
class CategoryBase(BaseModel):
    """
    Base schema with common category attributes.

    Contains the essential fields that represent a book category.

    Attributes:
        category_name: Name of the book category/genre
        category_desc: Optional description of the category
    """

    category_name: str
    category_desc: Optional[str] = None


# ----- Read Schema -----
class CategoryRead(CategoryBase):
    """
    Schema for retrieving category information.

    Extends CategoryBase with the category's unique identifier.

    Attributes:
        id: Unique identifier for the category
    """

    id: int

    class Config:
        from_attributes = True


# ----- Create Schema (If needed in future) -----
# class CategoryCreate(CategoryBase):
#    """
#    Schema for creating a new category.
#
#    Currently not implemented but prepared for future extension.
#    """
#    pass
