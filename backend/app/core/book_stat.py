from typing import List

from app.db import BookStats
from app.schema.review import ReviewRequest
from sqlalchemy import text
from sqlalchemy.orm import Session


async def update_book_stats(db: Session, book_ids: List[int]):
    """
    Update BookStats table for specific books with current statistics
    - review_count: number of reviews
    - total_star: sum of all ratings
    - avg_rating: total_star / review_count
    - lowest_price: considering discounts and regular price
    """
    try:
        for book_id in book_ids:
            # Get review statistics
            review_query = text("""
                SELECT COUNT(id) as review_count,
                COALESCE(SUM(rating_star), 0) as total_star,
                CASE
                    WHEN COUNT(id) > 0 THEN COALESCE(AVG(rating_star), 0)
                    ELSE 0
                END as avg_rating
                FROM review WHERE book_id = :book_id
            """)
            review_stats = db.execute(review_query, {"book_id": book_id}).fetchone()

            # Get current lowest price (either discount price or regular price)
            price_query = text("""
                SELECT
                    CASE
                        WHEN d.discount_price IS NOT NULL THEN d.discount_price
                        ELSE b.book_price
                    END as lowest_price
                FROM book b
                LEFT JOIN discount d ON b.id = d.book_id
                AND CURRENT_DATE BETWEEN d.discount_start_date AND d.discount_end_date
                WHERE b.id = :book_id
                ORDER BY lowest_price ASC
                LIMIT 1
            """)
            price_result = db.execute(price_query, {"book_id": book_id}).fetchone()

            # Update book stats
            update_query = text("""
                UPDATE book_stats
                SET review_count = :review_count,
                    total_star = :total_star,
                    avg_rating = :avg_rating,
                    lowest_price = :lowest_price
                WHERE id = :book_id
            """)

            db.execute(
                update_query,
                {
                    "book_id": book_id,
                    "review_count": review_stats.review_count,
                    "total_star": review_stats.total_star,
                    "avg_rating": review_stats.avg_rating,
                    "lowest_price": price_result.lowest_price,
                },
            )

        db.commit()
    except Exception as e:
        db.rollback()
        raise Exception(f"Failed to update book stats: {str(e)}")


async def refresh_review_stats(db: Session, review: ReviewRequest) -> None:
    """Update the review statistics for a book. Called whenever a new review is added."""
    book_id = review.book_id
    stats = (
        db.query(BookStats.review_count, BookStats.total_star)
        .filter(BookStats.id == book_id)
        .first()
    )
    review_count, total_star = stats if stats else (0, 0)

    review_count += 1
    total_star += review.rating_star
    avg_rating = total_star / review_count

    db.query(BookStats).filter(BookStats.id == book_id).update(
        {
            BookStats.review_count: review_count,
            BookStats.total_star: total_star,
            BookStats.avg_rating: avg_rating,
        },
    )

    db.commit()
