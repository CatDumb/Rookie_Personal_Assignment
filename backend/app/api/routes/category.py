from app.core.db_config import get_db
from app.db.category import Category
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/category",
    tags=["category"],
)


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[Category],
)
async def get_categories(db: Session = Depends(get_db)):
    """Return all categories with id and name"""
    try:
        # Add ORDER BY to sort alphabetically by category_name
        categories = db.query(Category).order_by(Category.category_name).all()

        # Debug the actual data
        for cat in categories:
            print(
                f"Category ID: {cat.id}, Name: {cat.category_name}, Desc: {cat.category_desc}",
            )

        # Create explicit dictionaries to ensure fields are mapped correctly
        result = [
            {
                "id": cat.id,
                "category_name": cat.category_name,
                "category_desc": cat.category_desc,
            }
            for cat in categories
        ]
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching categories: {str(e)}",
        )
