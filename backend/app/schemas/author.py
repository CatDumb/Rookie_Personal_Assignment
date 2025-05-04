"""
Author-related Pydantic schemas for API request/response handling.

This module defines the data models for book author operations including
author retrieval and potential future operations like creation.
"""

from typing import Optional

from pydantic import BaseModel


# ----- Base Schema -----
class AuthorBase(BaseModel):
    """
    Base schema with common author attributes.

    Contains the essential fields that represent a book author.

    Attributes:
        author_name: Full name of the author
        author_bio: Optional biographical information about the author
    """

    author_name: str
    author_bio: Optional[str] = None


# ----- Read Schema -----
class AuthorRead(AuthorBase):
    """
    Schema for retrieving author information.

    Extends AuthorBase with the author's unique identifier.

    Attributes:
        id: Unique identifier for the author
    """

    id: int

    class Config:
        from_attributes = True


# ----- Create Schema (If needed in future) -----
# class AuthorCreate(AuthorBase):
#    """
#    Schema for creating a new author.
#
#    Currently not implemented but prepared for future extension.
#    """
#    pass
