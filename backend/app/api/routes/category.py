"""Category-related API endpoints."""

from app.core.db_config import get_db
from app.db.category import Category as CategoryModel
from app.schemas.category import CategoryRead
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/category",
    tags=["category"],
)


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[CategoryRead],
)
async def get_categories(db: Session = Depends(get_db)):
    """
    Return all book categories with their ID, name, and description.

    Args:
        db (Session): Database session dependency

    Returns:
        list[CategoryRead]: List of category objects containing id, category_name, and category_desc

    Raises:
        HTTPException: If there's an error while fetching categories (500)
    """
    try:
        categories = db.query(CategoryModel).order_by(CategoryModel.category_name).all()
        return categories
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching categories: {str(e)}",
        )
