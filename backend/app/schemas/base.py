"""
Common base models for Pydantic schemas
"""

from typing import Dict, Generic, List, Optional, TypeVar

from pydantic import BaseModel

# Define a generic type variable for use with response models
T = TypeVar("T")


# Base model for pagination responses
class PaginationInfo(BaseModel):
    """Base pagination information model"""

    total: int
    page: int
    per_page: int
    pages: int


# Generic paginated response model
class PaginatedResponse(PaginationInfo, Generic[T]):
    """Generic paginated response with items of type T"""

    items: List[T]


# Base model for item responses
class ItemsResponse(BaseModel, Generic[T]):
    """Generic response with a list of items of type T"""

    items: List[T]


# Generic API response for consistent message format
class ApiResponse(BaseModel, Generic[T]):
    """Generic API response with success flag, optional data and message"""

    success: bool
    data: Optional[T] = None
    message: Optional[str] = None
    errors: Optional[Dict[str, List[str]]] = None
