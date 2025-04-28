from fastapi import APIRouter

from .author import router as author_router
from .book import router as book_router
from .category import router as category_router
from .review import router as review_router
from .user import router as user_router

api_router = APIRouter(prefix="/api")
api_router.include_router(user_router)
api_router.include_router(book_router)
api_router.include_router(review_router)
api_router.include_router(category_router)
api_router.include_router(author_router)
