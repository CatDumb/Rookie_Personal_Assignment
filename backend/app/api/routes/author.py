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
    """Return all authors with id and name"""
    try:
        # Add ORDER BY to sort alphabetically by author_name
        authors = db.query(Author).order_by(Author.author_name).all()

        # Debug the actual data
        for author in authors:
            print(
                f"Author ID: {author.id}, Name: {author.author_name}, Desc: {author.author_bio}",
            )

        # Create explicit dictionaries to ensure fields are mapped correctly
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
