"""
Book review API endpoints and operations.

This module provides API routes for managing book reviews including:
- Retrieving paginated reviews for books
- Getting review statistics
- Adding new reviews

It also handles updating book statistics when reviews are added.
"""

import math

from app.core.book_stat import refresh_review_stats
from app.core.db_config import get_db

# Import DB Models
from app.db.book import Book  # Needed for checking if book exists
from app.db.bookstats import BookStats
from app.db.review import Review
from app.schemas.bookstats import BookStatsResponse
from app.schemas.review import (
    PaginatedReviewsResponse,
    ReviewFilterRequest,
    ReviewPostRequest,
    ReviewPostResponse,
)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/review",
    tags=["review"],
)


@router.get("/book/{book_id}", response_model=PaginatedReviewsResponse)
async def get_book_reviews(
    filters: ReviewFilterRequest = Depends(),
    db: Session = Depends(get_db),
):
    """
    Get paginated reviews for a specific book with filtering and sorting options.

    Args:
        filters (ReviewFilterRequest): Filtering and pagination parameters including:
            - book_id: ID of the book to get reviews for
            - rating: Filter reviews by rating star (1-5)
            - sort_order: Sort by review date ('newest' or 'oldest')
            - page: Page number for pagination
            - per_page: Number of items per page (5, 15, 20, or 25)
        db (Session): Database session dependency

    Returns:
        PaginatedReviewsResponse: Paginated list of reviews with metadata

    Raises:
        HTTPException: If book is not found (404) or other errors (500)
    """
    try:
        # Check if book exists
        book = db.query(Book).filter(Book.id == filters.book_id).first()
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {filters.book_id} not found",
            )

        # Base query for reviews of the specific book
        query = db.query(Review).filter(Review.book_id == filters.book_id)

        # Apply rating filter if specified
        if filters.rating is not None:
            query = query.filter(Review.rating_star == filters.rating)

        # Apply sorting
        if filters.sort_order.lower() == "oldest":
            query = query.order_by(asc(Review.review_date))
        else:  # Default to newest
            query = query.order_by(desc(Review.review_date))

        # Count total before pagination
        total_items = query.count()
        total_pages = (
            (total_items + filters.per_page - 1) // filters.per_page
            if total_items > 0
            else 0
        )

        # Apply pagination
        reviews = (
            query.offset((filters.page - 1) * filters.per_page)
            .limit(filters.per_page)
            .all()
        )

        # Transform to response model
        reviews_data = [
            ReviewPostResponse(
                book_id=review.book_id,
                review_title=review.review_title,
                review_details=review.review_details,
                review_date=review.review_date,
                rating_star=review.rating_star,
            )
            for review in reviews
        ]

        # Create paginated response
        response = PaginatedReviewsResponse(
            items=reviews_data,
            total=total_items,
            page=filters.page,
            per_page=filters.per_page,
            pages=total_pages,
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving book reviews: {str(e)}",
        )


@router.get("/book/{book_id}/stats", response_model=BookStatsResponse)
async def get_book_stats(
    book_id: int,
    db: Session = Depends(get_db),
):
    """
    Get comprehensive review statistics for a specific book.

    Retrieves the following statistics:
    - Total review count
    - Average rating (rounded to 2 decimal places)
    - Count of reviews for each star rating (1-5)

    Args:
        book_id (int): The ID of the book to get statistics for
        db (Session): Database session dependency

    Returns:
        BookStatsResponse: Book review statistics

    Raises:
        HTTPException: If book or statistics are not found (404) or other errors (500)
    """
    try:
        # Check if book exists
        book = db.query(Book).filter(Book.id == book_id).first()
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {book_id} not found",
            )

        # Get book stats (review_count and avg_rating)
        book_stats = db.query(BookStats).filter(BookStats.id == book_id).first()

        if not book_stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Statistics for book with id {book_id} not found",
            )

        # Count reviews for each star rating (1-5)
        star_counts = {
            "star_1": 0,
            "star_2": 0,
            "star_3": 0,
            "star_4": 0,
            "star_5": 0,
        }

        # Query to count reviews by rating
        for rating in range(1, 6):
            count = (
                db.query(Review)
                .filter(
                    Review.book_id == book_id,
                    Review.rating_star == rating,
                )
                .count()
            )
            star_counts[f"star_{rating}"] = count

        # Round down avg_rating to two decimal places
        avg_rating = math.floor(book_stats.avg_rating * 100) / 100
        stats = {
            "review_count": book_stats.review_count,
            "avg_rating": avg_rating,
            "star_5": star_counts["star_5"],
            "star_4": star_counts["star_4"],
            "star_3": star_counts["star_3"],
            "star_2": star_counts["star_2"],
            "star_1": star_counts["star_1"],
        }

        # Wrap in response model
        response = BookStatsResponse(items=[stats])

        return response

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving book statistics: {str(e)}",
        )


@router.post(
    "/book",
    status_code=status.HTTP_201_CREATED,
    response_model=ReviewPostResponse,
)
async def add_book_review(
    review: ReviewPostRequest,
    db: Session = Depends(get_db),
):
    """
    Add a new review for a specific book.

    This endpoint creates a new review in the database and updates
    the book's statistics (average rating, review count).

    Args:
        review (ReviewPostRequest): Review data including book ID, title,
                                   details, and rating
        db (Session): Database session dependency

    Returns:
        ReviewPostResponse: Created review with its details

    Raises:
        HTTPException: If book doesn't exist (404) or other errors (500)
    """
    try:
        # Check if the book exists using the Book model
        book = db.query(Book).filter(Book.id == review.book_id).first()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")

        # Create a new review instance using the Model
        new_review = Review(
            book_id=review.book_id,
            review_title=review.review_title,
            review_details=review.review_details,
            # Use review_date from the request schema (which has a default)
            review_date=review.review_date,
            rating_star=review.rating_star,
        )

        db.add(new_review)
        db.commit()
        db.refresh(new_review)

        # Refresh book statistics using the review data
        await refresh_review_stats(db, review)

        # Return the ORM object, Pydantic handles conversion
        return new_review

    except HTTPException:
        raise
