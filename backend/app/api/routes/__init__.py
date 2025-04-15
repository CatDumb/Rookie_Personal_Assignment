from fastapi import APIRouter

from .book import router as book_router
from .user import router as user_router

api_router = APIRouter()
api_router.include_router(user_router)
api_router.include_router(book_router)
