"""Book-related API endpoints and operations."""

from datetime import datetime

from app.core.book_stat import update_book_stats
from app.core.db_config import get_db
from app.db.author import Author
from app.db.book import Book
from app.db.bookstats import BookStats
from app.db.category import Category
from app.db.discount import Discount
from app.schemas.book import (
    BookDetail,
    BookDetailResponse,
    BookFilterRequest,
    BooksOnSaleResponse,
    DiscountedBook,
    PaginatedBooksResponse,
    PopularBook,
    PopularBooksResponse,
    RatedBook,
    RecommendedBooksResponse,
)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/book",
    tags=["book"],
)


@router.get("/", response_model=PaginatedBooksResponse)
async def list_books(
    filters: BookFilterRequest = Depends(),
    db: Session = Depends(get_db),
):
    """
    Get a paginated list of books with filtering and sorting options.

    Args:
        filters (BookFilterRequest): Filtering and pagination parameters including:
            - category_ids_csv: Comma-separated list of category IDs
            - author_ids_csv: Comma-separated list of author IDs
        db (Session): Database session dependency

    Returns:
        PaginatedBooksResponse: Paginated list of books with metadata

    Raises:
        HTTPException: If there's an error retrieving books (500)
    """
    try:
        query = (
            db.query(
                Book,
                Author,
                Category,
                Discount,
                BookStats,
            )
            .join(Author, Book.author_id == Author.id)
            .join(Category, Book.category_id == Category.id)
            .outerjoin(
                Discount,
                (Book.id == Discount.book_id)
                & (Discount.discount_start_date <= func.current_date())
                & (Discount.discount_end_date >= func.current_date()),
            )
            .outerjoin(BookStats, Book.id == BookStats.id)
        )

        # Always prioritize CSV string parameters over direct parameters
        parsed_category_ids = []
        if filters.category_ids_csv:
            try:
                parsed_category_ids = [
                    int(id.strip())
                    for id in filters.category_ids_csv.split(",")
                    if id.strip()
                ]
                # Apply category filter from CSV
                query = query.filter(Book.category_id.in_(parsed_category_ids))
            except ValueError:
                pass
        elif filters.category_ids and len(filters.category_ids) > 0:
            # Apply category filter from array
            query = query.filter(Book.category_id.in_(filters.category_ids))
        elif filters.category_id is not None:
            # Apply single category filter
            query = query.filter(Book.category_id == filters.category_id)

        parsed_author_ids = []
        if filters.author_ids_csv:
            try:
                parsed_author_ids = [
                    int(id.strip())
                    for id in filters.author_ids_csv.split(",")
                    if id.strip()
                ]
                # Apply author filter from CSV
                query = query.filter(Book.author_id.in_(parsed_author_ids))
            except ValueError:
                pass
        elif filters.author_ids and len(filters.author_ids) > 0:
            # Apply author filter from array
            query = query.filter(Book.author_id.in_(filters.author_ids))
        elif filters.author_id is not None:
            # Apply single author filter
            query = query.filter(Book.author_id == filters.author_id)

        if filters.rating_min is not None:
            query = query.filter(BookStats.avg_rating >= filters.rating_min)

        if filters.sort_by == "onsale":
            query = query.order_by(
                func.coalesce(Book.book_price - Discount.discount_price, 0).desc(),
                Book.book_title.asc(),
            )
        elif filters.sort_by == "popularity":
            query = query.order_by(
                func.coalesce(BookStats.review_count, 0).desc(),
                Book.book_title.asc(),
            )
        elif filters.sort_by == "price_asc":
            query = query.order_by(
                func.coalesce(BookStats.lowest_price, Book.book_price).asc(),
                Book.book_title.asc(),
            )
        elif filters.sort_by == "price_desc":
            query = query.order_by(
                func.coalesce(BookStats.lowest_price, Book.book_price).desc(),
                Book.book_title.asc(),
            )
        else:
            query = query.order_by(Book.book_title.asc())

        total_items = query.count()
        total_pages = (total_items + filters.per_page - 1) // filters.per_page

        query = query.offset((filters.page - 1) * filters.per_page).limit(
            filters.per_page,
        )

        result = query.all()

        books_data = []
        book_ids = []
        for book, author, _category, discount, _stats in result:
            books_data.append(
                DiscountedBook(
                    id=book.id,
                    book_title=book.book_title,
                    author=author.author_name,
                    book_price=book.book_price,
                    discount_price=discount.discount_price if discount else None,
                    book_cover_photo=book.book_cover_photo,
                    discount_amount=(book.book_price - discount.discount_price)
                    if discount and discount.discount_price is not None
                    else 0,
                ),
            )
            book_ids.append(book.id)

        response = PaginatedBooksResponse(
            items=books_data,
            total=total_items,
            page=filters.page,
            per_page=filters.per_page,
            pages=total_pages,
        )

        await update_book_stats(db, book_ids)

        return response

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving books: {str(e)}",
        )


@router.get(
    "/on_sale",
    status_code=status.HTTP_200_OK,
    response_model=BooksOnSaleResponse,
)
async def get_books_on_sale(db: Session = Depends(get_db)):
    """
    Return top 10 books with the highest discount amount.

    Args:
        db (Session): Database session dependency

    Returns:
        BooksOnSaleResponse: List of discounted books sorted by discount amount

    Raises:
        HTTPException: If there's an error retrieving books (500)
    """
    try:
        current_date = datetime.now().date()

        books = (
            db.query(Book, Author, Discount)
            .join(Author, Book.author_id == Author.id)
            .join(Discount, Book.id == Discount.book_id)
            .filter(Discount.discount_start_date <= current_date)
            .filter(Discount.discount_end_date >= current_date)
            .filter(
                Discount.discount_price < Book.book_price,
            )
        )

        books_with_discount = []
        for book, author, discount in books.all():
            discount_amount = book.book_price - discount.discount_price
            books_with_discount.append(
                {
                    "book": book,
                    "author": author,
                    "discount": discount,
                    "discount_amount": discount_amount,
                },
            )

        sorted_books = sorted(
            books_with_discount,
            key=lambda x: x["discount_amount"],
            reverse=True,
        )[:10]

        on_sale_books = [
            DiscountedBook(
                id=item["book"].id,
                book_title=item["book"].book_title,
                author=item["author"].author_name,
                book_price=item["book"].book_price,
                discount_price=item["discount"].discount_price,
                book_cover_photo=item["book"].book_cover_photo,
                discount_amount=item["discount_amount"],
            )
            for item in sorted_books
        ]

        return BooksOnSaleResponse(items=on_sale_books)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving books on sale: {str(e)}",
        )


@router.get(
    "/featured/recommended",
    status_code=status.HTTP_200_OK,
    response_model=RecommendedBooksResponse,
)
async def get_recommended_books(db: Session = Depends(get_db)):
    """
    Get top 8 recommended books based on highest average rating and lowest price.

    Args:
        db (Session): Database session dependency

    Returns:
        RecommendedBooksResponse: List of recommended books with rating information

    Raises:
        HTTPException: If there's an error retrieving books (500)
    """
    try:
        current_date = datetime.now().date()
        books = (
            db.query(Book, Author, BookStats, Discount)
            .join(BookStats, Book.id == BookStats.id)
            .join(Author, Book.author_id == Author.id)
            .outerjoin(
                Discount,
                (Book.id == Discount.book_id)
                & (Discount.discount_start_date <= current_date)
                & (Discount.discount_end_date >= current_date),
            )
            .filter(BookStats.review_count > 0)
            .order_by(BookStats.avg_rating.desc(), BookStats.lowest_price.asc())
            .limit(8)
            .all()
        )

        recommended_books = [
            RatedBook(
                id=book.id,
                book_title=book.book_title,
                author=author.author_name,
                book_price=book.book_price,
                discount_price=discount.discount_price if discount else None,
                book_cover_photo=book.book_cover_photo,
                avg_rating=stats.avg_rating,
                review_count=stats.review_count,
            )
            for book, author, stats, discount in books
        ]

        book_ids = [book.id for book, _, _, _ in books]
        await update_book_stats(db, book_ids)

        return RecommendedBooksResponse(items=recommended_books)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving recommended books: {str(e)}",
        )


@router.get(
    "/featured/popular",
    status_code=status.HTTP_200_OK,
    response_model=PopularBooksResponse,
)
async def get_popular_books(db: Session = Depends(get_db)):
    """
    Get top 8 popular books based on highest number of reviews and lowest price.

    Args:
        db (Session): Database session dependency

    Returns:
        PopularBooksResponse: List of popular books with review count information

    Raises:
        HTTPException: If there's an error retrieving books (500)
    """
    try:
        current_date = datetime.now().date()
        books = (
            db.query(Book, Author, BookStats, Discount)
            .join(BookStats, Book.id == BookStats.id)
            .join(Author, Book.author_id == Author.id)
            .outerjoin(
                Discount,
                (Book.id == Discount.book_id)
                & (Discount.discount_start_date <= current_date)
                & (Discount.discount_end_date >= current_date),
            )
            .order_by(
                func.coalesce(BookStats.review_count, 0).desc(),
                Book.book_title.asc(),
            )
            .limit(8)
            .all()
        )

        popular_books = [
            PopularBook(
                id=book.id,
                book_title=book.book_title,
                author=author.author_name,
                book_price=book.book_price,
                discount_price=discount.discount_price if discount else None,
                book_cover_photo=book.book_cover_photo,
                review_count=db.query(BookStats.review_count)
                .filter(BookStats.id == book.id)
                .scalar(),
            )
            for book, author, stats, discount in books
        ]

        book_ids = [book.id for book, _, _, _ in books]
        await update_book_stats(db, book_ids)

        return PopularBooksResponse(items=popular_books)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving popular books: {str(e)}",
        )


@router.get(
    "/{book_id}",
    status_code=status.HTTP_200_OK,
    response_model=BookDetailResponse,
)
async def get_book_by_id(book_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific book by its ID.

    Args:
        book_id (int): The ID of the book to retrieve
        db (Session): Database session dependency

    Returns:
        BookDetailResponse: Detailed book information including category, author,
                           pricing, and stats

    Raises:
        HTTPException: If book not found (404) or other errors (500)
    """
    try:
        current_date = datetime.now().date()
        book_data = (
            db.query(Book, Author, Category, BookStats, Discount)
            .join(Author, Book.author_id == Author.id)
            .join(Category, Book.category_id == Category.id)
            .outerjoin(BookStats, Book.id == BookStats.id)
            .outerjoin(
                Discount,
                (Book.id == Discount.book_id)
                & (Discount.discount_start_date <= current_date)
                & (Discount.discount_end_date >= current_date),
            )
            .filter(Book.id == book_id)
            .first()
        )

        if not book_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {book_id} not found",
            )

        book, author, category, stats, discount = book_data

        book_detail_data = {
            "id": book.id,
            "book_title": book.book_title,
            "author": author.author_name,
            "category": category.category_name,
            "book_price": book.book_price,
            "book_summary": book.book_summary,
            "book_cover_photo": book.book_cover_photo,
            "discount_price": discount.discount_price if discount else None,
            "avg_rating": stats.avg_rating if stats else 0.0,
            "review_count": stats.review_count if stats else 0,
        }

        book_detail = BookDetail(**book_detail_data)
        response = BookDetailResponse(book=book_detail)

        await update_book_stats(db, [book_id])

        return response
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving book details: {str(e)}",
        )
