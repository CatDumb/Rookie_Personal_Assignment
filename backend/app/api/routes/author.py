"""Author-related API endpoints."""

from app.core.db_config import get_db
from app.db.author import Author
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/author",
    tags=["author"],
)


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[Author],
)
async def get_authors(db: Session = Depends(get_db)):
    """
    Return all authors with their ID, name, and bio.

    Args:
        db (Session): Database session dependency

    Returns:
        list[Author]: List of author objects containing id, author_name, and author_bio

    Raises:
        HTTPException: If there's an error while fetching authors (500)
    """
    try:
        authors = db.query(Author).order_by(Author.author_name).all()

        result = [
            {
                "id": author.id,
                "author_name": author.author_name,
                "author_bio": author.author_bio,
            }
            for author in authors
        ]
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching authors: {str(e)}",
        )
