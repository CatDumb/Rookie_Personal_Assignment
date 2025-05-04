from typing import List, Optional

from app.schemas.base import ItemsResponse, PaginatedResponse
from pydantic import BaseModel, Field


# ----- Base Schema -----
class BookBase(BaseModel):
    book_title: str = Field(...)
    book_summary: Optional[str] = Field(None)
    book_cover_photo: Optional[str] = Field(None)
    book_price: float = Field(...)
    author_id: Optional[int] = None
    category_id: Optional[int] = None


# ----- Schema for Creating (If Admin endpoint exists) -----
class BookCreate(BookBase):
    author_id: int  # Required on creation
    category_id: int  # Required on creation
    # Add other required fields like stock if necessary


# ----- Schema for Updating (If Admin endpoint exists) -----
class BookUpdate(BookBase):
    # All fields optional for update
    book_title: Optional[str] = Field(None)
    book_price: Optional[float] = Field(None)
    author_id: Optional[int] = None
    category_id: Optional[int] = None


# ----- Schemas for Reading -----


# Basic Book Info (e.g., for lists)
class BookRead(BookBase):
    id: int
    author: str  # Flattened author name
    category: Optional[str] = None  # Flattened category name
    book_price: float
    discount_price: Optional[float] = None  # Populated by join
    avg_rating: Optional[float] = Field(0.0)  # From BookStats
    review_count: Optional[int] = Field(0)  # From BookStats

    class Config:
        from_attributes = True
        populate_by_name = True  # Allows using aliases like book_title


# Detailed Book Info (for single book endpoint)
class BookDetail(BookRead):
    # Inherits fields from BookRead
    # Add any extra fields only present in detail view if needed
    # Example: full author/category objects instead of just names
    # author: AuthorRead
    # category: CategoryRead
    pass  # No extra fields identified for now, uses BookRead structure


# Specific response schema names matching routes
class BookDetailResponse(BaseModel):
    book: BookDetail


# ----- Common base for all book display types -----
class BookDisplayBase(BaseModel):
    id: int
    book_title: str
    author: str
    book_price: float
    discount_price: Optional[float] = None
    book_cover_photo: Optional[str] = None

    class Config:
        from_attributes = True


# Schema for discounted books (used in lists/on_sale)
class DiscountedBook(BookDisplayBase):
    discount_amount: Optional[float] = None  # Calculated field


# Schema for recommended books
class RatedBook(BookDisplayBase):
    avg_rating: float
    review_count: int  # Matches frontend field name


# Schema for popular books
class PopularBook(BookDisplayBase):
    review_count: Optional[int] = 0  # Matches frontend field name


# ----- Pagination/List Schemas -----
# Response for general book list
class PaginatedBooksResponse(PaginatedResponse[DiscountedBook]):
    pass


# Response for On Sale books
class BooksOnSaleResponse(ItemsResponse[DiscountedBook]):
    pass


# Response for Recommended books
class RecommendedBooksResponse(ItemsResponse[RatedBook]):
    pass


# Response for Popular books
class PopularBooksResponse(ItemsResponse[PopularBook]):
    pass


# ----- Request Schema for Filtering -----
class BookFilterRequest(BaseModel):
    page: int = 1
    per_page: int = 15
    category_ids: Optional[List[int]] = None  # Allow multiple IDs
    author_ids: Optional[List[int]] = None  # Allow multiple IDs
    category_ids_csv: Optional[str] = Field(
        None,
        description="Comma-separated list of category IDs",
    )
    author_ids_csv: Optional[str] = Field(
        None,
        description="Comma-separated list of author IDs",
    )
    rating_min: Optional[float] = Field(None, ge=0, le=5)
    sort_by: Optional[str] = Field(
        None,
        pattern="^(onsale|popularity|price_asc|price_desc)$",
    )  # Allowed sort values
