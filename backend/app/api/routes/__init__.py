"""
API routes configuration and registration module.

This module imports and registers all API route routers with the main API router.
Each domain-specific router (books, users, etc.) is imported and included
in the main api_router with appropriate prefix.
"""

from fastapi import APIRouter

from .author import router as author_router
from .book import router as book_router
from .category import router as category_router
from .order import router as order_router
from .review import router as review_router
from .user import router as user_router

# Create the main API router with /api prefix for all routes
api_router = APIRouter(prefix="/api")

# Include all domain-specific routers
api_router.include_router(user_router)
api_router.include_router(book_router)
api_router.include_router(review_router)
api_router.include_router(category_router)
api_router.include_router(author_router)
api_router.include_router(order_router)
