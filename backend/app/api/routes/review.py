"""Book review API endpoints."""

from app.core.book_stat import refresh_review_stats
from app.core.db_config import get_db
from app.db.bookstats import BookStats
from app.db.review import Review
from app.schema.review import ReviewRequest, ReviewResponse
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/review",
    tags=["review"],
)


@router.get("/book/{book_id}")
def get_book_reviews(book_id: int):
    """
    Get reviews for a specific book.

    Args:
        book_id (int): ID of the book to retrieve reviews for

    Returns:
        dict: Book ID and list of reviews
    """
    return {"book_id": book_id, "reviews": ["review1", "review2"]}


@router.post(
    "/book/{book_id}",
    status_code=status.HTTP_201_CREATED,
    response_model=ReviewResponse,
)
async def add_book_review(review: ReviewRequest, db: Session = Depends(get_db)):
    """
    Add a review for a specific book.

    Args:
        review (ReviewRequest): Review data including title, details, rating
        db (Session): Database session dependency

    Returns:
        ReviewResponse: Created review data

    Raises:
        HTTPException: If book not found (404) or other errors (500)
    """
    try:
        # Check if the book exists
        book = db.query(BookStats).filter(BookStats.id == review.book_id).first()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")

        # Create a new review instance
        new_review = Review(
            book_id=review.book_id,
            review_title=review.review_title,
            review_details=review.review_details,
            review_date=review.review_date,
            rating_star=review.rating_star,
        )

        db.add(new_review)
        db.commit()
        db.refresh(new_review)

        await refresh_review_stats(db, review)

        return ReviewResponse.from_orm(new_review)

    except HTTPException:
        # Re-raise HTTP exceptions as they already have status codes
        raise
    except Exception as e:
        # Log the error and raise a 500 error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}",
        )
