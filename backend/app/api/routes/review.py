from fastapi import APIRouter

router = APIRouter(prefix="/review")


@router.get("/book/{book_id}")
def get_book_reviews(book_id: int):
    """Get reviews for a specific book"""
    return {"book_id": book_id, "reviews": ["review1", "review2"]}


@router.post("/book/{book_id}")
def add_book_review(book_id: int, review: str):
    """Add a review for a specific book"""
    return {"book_id": book_id, "review": review, "status": "added"}
