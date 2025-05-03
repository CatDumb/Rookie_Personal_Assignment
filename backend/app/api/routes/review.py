"""Book review API endpoints."""

from app.core.book_stat import refresh_review_stats
from app.core.db_config import get_db

# Import DB Models
from app.db.book import Book  # Needed for checking if book exists
from app.db.review import Review as ReviewModel  # Rename model import

# Import Schemas from new location
from app.schemas.review import ReviewRequest, ReviewResponse
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/review",
    tags=["review"],
)


# Placeholder for get reviews - needs implementation
@router.get("/book/{book_id}")
def get_book_reviews(book_id: int):
    """
    Get reviews for a specific book.
    (Needs implementation)
    """
    # Example: Fetch reviews from DB and return using ReviewRead schema
    # reviews_db = db.query(ReviewModel).filter(ReviewModel.book_id == book_id).all()
    # reviews_read = [ReviewRead.from_orm(r) for r in reviews_db]
    # return {"book_id": book_id, "reviews": reviews_read}
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet",
    )


@router.post(
    "/book/{book_id}",  # book_id in path is now redundant if it's in the body
    status_code=status.HTTP_201_CREATED,
    response_model=ReviewResponse,  # Use imported schema
)
# Pass book_id via path parameter for consistency or remove if always in body
async def add_book_review(
    book_id: int,
    review: ReviewRequest,
    db: Session = Depends(get_db),
):
    """
    Add a review for a specific book.
    """
    # Validate book_id consistency
    if review.book_id != book_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book ID in path does not match Book ID in request body.",
        )

    try:
        # Check if the book exists using the Book model
        book = db.query(Book).filter(Book.id == review.book_id).first()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")

        # Create a new review instance using the Model
        new_review = ReviewModel(
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

        # Refresh stats using the ReviewRequest data
        await refresh_review_stats(db, review)

        # Return the ORM object, Pydantic handles conversion
        return new_review

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}",
        )
