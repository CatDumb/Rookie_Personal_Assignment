"""
Database models package initialization.

This module imports and exports all database models, making them
available for import directly from the app.db package. This simplifies
imports in other parts of the application.
"""

from .author import Author
from .base import Base
from .book import Book
from .bookstats import BookStats
from .category import Category
from .discount import Discount
from .order import Order
from .order_item import OrderItem
from .review import Review
from .user import User

# Define the public API of the db package
__all__ = [
    "Base",
    "Author",
    "Book",
    "Category",
    "Discount",
    "OrderItem",
    "Order",
    "Review",
    "User",
    "BookStats",
]
