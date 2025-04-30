from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, validator


class ValidPerPage(int, Enum):
    SMALL = 5
    MEDIUM = 15
    LARGE = 20
    XLARGE = 25


class BookBase(BaseModel):
    """Base model for book data"""

    id: int
    name: str
    author: str
    price: float
    cover_photo: Optional[str] = None  # Make cover_photo optional to handle null values


class DiscountedBook(BookBase):
    """Model for books with active discounts"""

    discount_price: Optional[float] = None
    discount_amount: Optional[float] = None


class RatedBook(BookBase):
    """Model for books with ratings"""

    discount_price: Optional[float] = None
    average_rating: float
    total_reviews: int


class PopularBook(BookBase):
    """Model for popular books based on review count"""

    discount_price: Optional[float] = None
    review_count: int


class BookDetail(BaseModel):
    """Detailed book information for single book view"""

    id: int
    name: str
    author: str
    price: float
    discount_price: Optional[float] = None
    cover_photo: Optional[str] = None  # Make cover_photo optional
    summary: str
    average_rating: float
    review_count: int
    category: str


# Request models for book operations
class BookFilterRequest(BaseModel):
    """Request model for filtering books"""

    page: int = 1
    per_page: ValidPerPage = ValidPerPage.MEDIUM  # Default to 15
    category_id: Optional[int] = None
    author_id: Optional[int] = None
    rating_min: Optional[float] = None
    sort_by: str = "none"

    # Add validators if needed
    @validator("page")
    def validate_page(cls, v):
        if v < 1:
            return 1
        return v

    # No need for per_page validator as enum will handle it

    class Config:
        use_enum_values = True  # This ensures the enum int value is used


# Response models for book listing endpoints
class BooksOnSaleResponse(BaseModel):
    """Response model for books on sale"""

    items: List[DiscountedBook]


class RecommendedBooksResponse(BaseModel):
    """Response model for recommended books"""

    items: List[RatedBook]


class PopularBooksResponse(BaseModel):
    """Response model for popular books"""

    items: List[PopularBook]


class BookDetailResponse(BaseModel):
    """Response model for single book detail"""

    book: BookDetail


class PaginatedBooksResponse(BaseModel):
    """Paginated response model for book listings"""

    items: List[DiscountedBook]
    total: int
    page: int
    per_page: int
    pages: int
