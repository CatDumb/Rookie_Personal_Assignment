"""
Book-related Pydantic schemas for API request/response handling.

This module defines the data models for book-related API operations,
including book listing, filtering, detail views, and specialized book
collections like discounted or popular books.
"""

from typing import List, Optional

from app.schemas.base import ItemsResponse, PaginatedResponse
from pydantic import BaseModel, Field


# ----- Base Schema -----
class BookBase(BaseModel):
    """
    Base schema with common book attributes.

    This class serves as the foundation for book-related schemas,
    containing fields that are shared across different book operations.

    Attributes:
        book_title: Title of the book
        book_summary: Optional extended description or summary
        book_cover_photo: Optional filename or URL for book cover image
        book_price: Regular retail price of the book
        author_id: ID of the book's author
        category_id: ID of the book's category/genre
    """

    book_title: str = Field(...)
    book_summary: Optional[str] = Field(None)
    book_cover_photo: Optional[str] = Field(None)
    book_price: float = Field(...)
    author_id: Optional[int] = None
    category_id: Optional[int] = None


# ----- Schema for Creating (If Admin endpoint exists) -----
class BookCreate(BookBase):
    """
    Schema for creating a new book.

    Extends BookBase to make certain fields required during creation.

    Attributes:
        author_id: Required ID of the book's author
        category_id: Required ID of the book's category/genre
    """

    author_id: int  # Required on creation
    category_id: int  # Required on creation
    # Add other required fields like stock if necessary


# ----- Schema for Updating (If Admin endpoint exists) -----
class BookUpdate(BookBase):
    """
    Schema for updating an existing book.

    Makes all fields optional since updates may only change specific fields.

    Attributes:
        All fields inherited from BookBase but made optional
    """

    # All fields optional for update
    book_title: Optional[str] = Field(None)
    book_price: Optional[float] = Field(None)
    author_id: Optional[int] = None
    category_id: Optional[int] = None


# ----- Schemas for Reading -----


# Basic Book Info (e.g., for lists)
class BookRead(BookBase):
    """
    Schema for reading standard book information in listings.

    Includes additional display-oriented fields beyond the base attributes,
    such as author name and rating information.

    Attributes:
        id: Unique identifier for the book
        author: Author's name (denormalized from author table)
        category: Category name (denormalized from category table)
        discount_price: Current discounted price if available
        avg_rating: Average star rating from reviews
        review_count: Number of reviews for the book
    """

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
    """
    Schema for detailed book information for single book view.

    Currently inherits all fields from BookRead but could be extended
    with additional detailed information as needed.
    """

    # Inherits fields from BookRead
    # Add any extra fields only present in detail view if needed
    # Example: full author/category objects instead of just names
    # author: AuthorRead
    # category: CategoryRead
    pass  # No extra fields identified for now, uses BookRead structure


# Specific response schema names matching routes
class BookDetailResponse(BaseModel):
    """
    Response schema for the book detail endpoint.

    Wraps a BookDetail object to maintain consistent API response structure.

    Attributes:
        book: Detailed book information
    """

    book: BookDetail


# ----- Common base for all book display types -----
class BookDisplayBase(BaseModel):
    """
    Base schema for book display in various listing contexts.

    Contains essential fields needed for displaying a book in the UI.

    Attributes:
        id: Unique identifier for the book
        book_title: Title of the book
        author: Author's name
        book_price: Regular retail price
        discount_price: Optional discounted price if available
        book_cover_photo: Optional filename or URL for book cover image
    """

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
    """
    Schema for books with active discounts.

    Extends BookDisplayBase with discount-specific information.

    Attributes:
        discount_amount: Calculated amount saved (original price - discount price)
    """

    discount_amount: Optional[float] = None  # Calculated field


# Schema for recommended books
class RatedBook(BookDisplayBase):
    """
    Schema for books in the recommended books list.

    Extends BookDisplayBase with rating information for recommendations.

    Attributes:
        avg_rating: Average star rating from reviews
        review_count: Number of reviews for the book
    """

    avg_rating: float
    review_count: int  # Matches frontend field name


# Schema for popular books
class PopularBook(BookDisplayBase):
    """
    Schema for books in the popular books list.

    Extends BookDisplayBase with review count for popularity indication.

    Attributes:
        review_count: Number of reviews for the book
    """

    review_count: Optional[int] = 0  # Matches frontend field name


# ----- Pagination/List Schemas -----
# Response for general book list
class PaginatedBooksResponse(PaginatedResponse[DiscountedBook]):
    """
    Response schema for paginated book listings.

    Provides discounted book information with pagination metadata.
    """

    pass


# Response for On Sale books
class BooksOnSaleResponse(ItemsResponse[DiscountedBook]):
    """
    Response schema for books currently on sale.

    Contains a list of discounted books without pagination.
    """

    pass


# Response for Recommended books
class RecommendedBooksResponse(ItemsResponse[RatedBook]):
    """
    Response schema for recommended books.

    Contains a list of books with rating information.
    """

    pass


# Response for Popular books
class PopularBooksResponse(ItemsResponse[PopularBook]):
    """
    Response schema for popular books.

    Contains a list of books with review counts.
    """

    pass


# ----- Request Schema for Filtering -----
class BookFilterRequest(BaseModel):
    """
    Request schema for filtering and sorting the book catalog.

    Provides parameters for pagination, filtering by category or author,
    minimum rating, and sort order.

    Attributes:
        page: Page number for pagination (starts at 1)
        per_page: Number of items per page
        category_ids: Optional list of category IDs to filter by
        author_ids: Optional list of author IDs to filter by
        category_ids_csv: Comma-separated string of category IDs (alternative format)
        author_ids_csv: Comma-separated string of author IDs (alternative format)
        rating_min: Minimum average rating to include (0-5)
        sort_by: Field to sort results by (onsale, popularity, price_asc, price_desc)
    """

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
