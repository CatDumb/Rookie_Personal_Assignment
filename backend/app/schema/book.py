from typing import List, Optional

from pydantic import BaseModel


class BookBase(BaseModel):
    """Base model for book data"""

    id: int
    name: str
    author: str
    price: float
    cover_photo: str


class DiscountedBook(BookBase):
    """Model for books with active discounts"""

    discount_price: Optional[float] = None
    discount_amount: float


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
    cover_photo: str
    summary: str
    average_rating: float
    review_count: int
    category: str


# Request models for book operations
class BookFilterRequest(BaseModel):
    """Request model for filtering books"""

    page: int = 1
    per_page: int = 10
    category_id: Optional[int] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    rating_min: Optional[float] = None
    sort_by: str = "name"  # Options: name, price, rating
    sort_direction: str = "asc"  # Options: asc, desc


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

    items: List[BookBase]
    total: int
    page: int
    per_page: int
    pages: int
