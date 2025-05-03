"""Author-related API endpoints."""

from app.core.db_config import get_db
from app.db.author import Author as AuthorModel
from app.schemas.author import AuthorRead
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/author",
    tags=["author"],
)


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[AuthorRead],
)
async def get_authors(db: Session = Depends(get_db)):
    """
    Return all authors with their ID, name, and bio.

    Args:
        db (Session): Database session dependency

    Returns:
        list[AuthorRead]: List of author objects containing id, author_name, and author_bio

    Raises:
        HTTPException: If there's an error while fetching authors (500)
    """
    try:
        authors = db.query(AuthorModel).order_by(AuthorModel.author_name).all()
        return authors
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching authors: {str(e)}",
        )
