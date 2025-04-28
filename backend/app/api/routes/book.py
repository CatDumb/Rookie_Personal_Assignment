from app.core.book_stat import update_book_stats
from app.core.db_config import get_db
from app.db.author import Author
from app.db.book import Book
from app.db.bookstats import BookStats
from app.db.category import Category  # Add this import
from app.db.discount import Discount
from app.schema.book import BookDetail  # Add this import
from app.schema.book import (
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


@router.post("/", response_model=PaginatedBooksResponse)
def list_books(filters: BookFilterRequest = BookFilterRequest()):
    """Paginated list of books"""
    return {"message": "Paginated list of books"}


@router.get(
    "/on_sale",
    status_code=status.HTTP_200_OK,
    response_model=BooksOnSaleResponse,
)
async def get_books_on_sale(db: Session = Depends(get_db)):
    """Return top 10 books with the highest discount amount"""
    try:
        # Get current date to filter active discounts
        from datetime import datetime

        current_date = datetime.now().date()

        # Query books with active discounts
        books = (
            db.query(Book, Author, Discount)
            .join(Author, Book.author_id == Author.id)
            .join(Discount, Book.id == Discount.book_id)
            .filter(Discount.discount_start_date <= current_date)
            .filter(Discount.discount_end_date >= current_date)
            .filter(
                Discount.discount_price < Book.book_price,
            )  # Ensure discount is valid
        )

        # Add a calculated column for discount amount
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

        # Sort by discount amount and take top 10
        sorted_books = sorted(
            books_with_discount,
            key=lambda x: x["discount_amount"],
            reverse=True,
        )[:10]

        # Format the response using the Pydantic model
        on_sale_books = [
            DiscountedBook(
                id=item["book"].id,
                name=item["book"].book_title,
                author=item["author"].author_name,
                price=item["book"].book_price,
                discount_price=item["discount"].discount_price,
                cover_photo=item["book"].book_cover_photo,
                discount_amount=item["discount_amount"],
            )
            for item in sorted_books
        ]

        # Update book statistics for featured books - use await with async function
        book_ids = [item.id for item in on_sale_books]
        await update_book_stats(db, book_ids)

        return BooksOnSaleResponse(items=on_sale_books)

    except Exception as e:
        # Rollback transaction in case of error
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}",
        )


@router.get(
    "/featured/recommended",
    status_code=status.HTTP_200_OK,
    response_model=RecommendedBooksResponse,
)
async def get_recommended_books(db: Session = Depends(get_db)):
    """Return top 8 recommended books based on highest average rating and lowest price"""
    try:
        # Query books joined with their stats, ordered by rating and price
        books = (
            db.query(Book, Author, BookStats, Discount)
            .join(BookStats, Book.id == BookStats.id)
            .join(Author, Book.author_id == Author.id)
            .outerjoin(
                Discount,
                (Book.id == Discount.book_id)
                & (Discount.discount_start_date <= func.current_date())
                & (Discount.discount_end_date >= func.current_date()),
            )
            .filter(BookStats.review_count > 0)  # Filter out books with 0 reviews
            .order_by(BookStats.avg_rating.desc(), BookStats.lowest_price.asc())
            .limit(8)
            .all()
        )

        # Format the response using the Pydantic model
        recommended_books = [
            RatedBook(
                id=book.id,
                name=book.book_title,
                author=author.author_name,
                price=book.book_price,
                discount_price=discount.discount_price if discount else None,
                cover_photo=book.book_cover_photo,
                average_rating=stats.avg_rating,
                total_reviews=stats.review_count,
            )
            for book, author, stats, discount in books
        ]

        # Update book statistics for featured books
        book_ids = [book.id for book, _, _, _ in books]
        await update_book_stats(db, book_ids)

        return RecommendedBooksResponse(items=recommended_books)

    except Exception as e:
        # Rollback transaction in case of error
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}",
        )


@router.get(
    "/featured/popular",
    status_code=status.HTTP_200_OK,
    response_model=PopularBooksResponse,
)
async def get_popular_books(db: Session = Depends(get_db)):
    """Return top 8 popular books based on highest numbers of review and lowest price"""
    try:
        # Query books joined with their stats, ordered by rating and price, and filter out books with 0 reviews
        books = (
            db.query(Book, Author, Discount)
            .join(BookStats, Book.id == BookStats.id)
            .join(Author, Book.author_id == Author.id)
            .outerjoin(
                Discount,
                (Book.id == Discount.book_id)
                & (Discount.discount_start_date <= func.current_date())
                & (Discount.discount_end_date >= func.current_date()),
            )
            .order_by(BookStats.review_count.desc(), Discount.discount_price.asc())
            .limit(8)
            .all()
        )

        # Format the response using the Pydantic model
        popular_books = [
            PopularBook(
                id=book.id,
                name=book.book_title,
                author=author.author_name,
                price=book.book_price,
                discount_price=discount.discount_price if discount else None,
                cover_photo=book.book_cover_photo,
                review_count=db.query(BookStats.review_count)
                .filter(BookStats.id == book.id)
                .scalar(),
            )
            for book, author, discount in books
        ]

        # Update book statistics for featured books - use await with async function
        book_ids = [book.id for book, _, _ in books]
        await update_book_stats(db, book_ids)

        return PopularBooksResponse(items=popular_books)

    except Exception as e:
        # Rollback transaction in case of error
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}",
        )


@router.get(
    "/{book_id}",
    status_code=status.HTTP_200_OK,
    response_model=BookDetailResponse,
)
async def get_book_by_id(book_id: int, db: Session = Depends(get_db)):
    """Get book by ID"""
    try:
        # Query books with associations
        book_data = (
            db.query(Book, Category, Author)
            .join(Category, Book.category_id == Category.id)
            .join(Author, Book.author_id == Author.id)
            .filter(Book.id == book_id)
            .first()
        )

        if not book_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {book_id} not found",
            )

        book, category, author = book_data

        # Get any active discount
        discount = (
            db.query(Discount)
            .filter(
                Discount.book_id == book_id,
                Discount.discount_start_date <= func.current_date(),
                Discount.discount_end_date >= func.current_date(),
            )
            .first()
        )

        # Get book stats
        stats = db.query(BookStats).filter(BookStats.id == book_id).first()

        return BookDetailResponse(
            book=BookDetail(
                id=book.id,
                name=book.book_title,
                author=author.author_name,
                price=float(book.book_price),
                discount_price=float(discount.discount_price) if discount else None,
                cover_photo=book.book_cover_photo,
                summary=book.book_summary,
                average_rating=float(stats.avg_rating) if stats else 0,
                review_count=stats.review_count if stats else 0,
                category=category.category_name,
            ),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}",
        )
