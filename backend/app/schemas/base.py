"""
Common base models for Pydantic schemas across the application.

This module provides reusable base models for consistent API responses,
including pagination structures, standardized message formats, and
generic containers for different data types.
"""

from typing import Dict, Generic, List, Optional, TypeVar

from pydantic import BaseModel

# Define a generic type variable for use with response models
T = TypeVar("T")


# Base model for pagination responses
class PaginationInfo(BaseModel):
    """
    Base pagination information model.

    Provides standardized metadata about paginated results for consistent
    pagination handling in the frontend.

    Attributes:
        total: Total number of items across all pages
        page: Current page number (1-based)
        per_page: Number of items per page
        pages: Total number of pages
    """

    total: int
    page: int
    per_page: int
    pages: int


# Generic paginated response model
class PaginatedResponse(PaginationInfo, Generic[T]):
    """
    Generic paginated response with items of type T.

    Combines pagination metadata with the actual paginated items.

    Attributes:
        items: List of items on the current page
    """

    items: List[T]


# Base model for item responses
class ItemsResponse(BaseModel, Generic[T]):
    """
    Generic response with a list of items of type T.

    Used for endpoints that return collections without pagination.

    Attributes:
        items: List of items in the response
    """

    items: List[T]


# Generic API response for consistent message format
class ApiResponse(BaseModel, Generic[T]):
    """
    Generic API response with standardized format.

    Provides a consistent wrapper for all API responses with success status,
    optional data payload, informational message, and validation errors.

    Attributes:
        success: Whether the request was successful
        data: Optional payload of type T (e.g., user data, book data)
        message: Optional human-readable message about the operation
        errors: Optional dictionary of field-specific validation errors
    """

    success: bool
    data: Optional[T] = None
    message: Optional[str] = None
    errors: Optional[Dict[str, List[str]]] = None
