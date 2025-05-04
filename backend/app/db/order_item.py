"""
Order item database model for storing order line items.

This module defines the SQLModel for the OrderItem table, which represents
individual books within a customer order, including quantity and price.
"""

from sqlalchemy import BigInteger, Numeric, SmallInteger
from sqlmodel import Field

from .base import Base


class OrderItem(Base, table=True):
    """
    Database model representing a line item within a customer order.

    Each order item links to a specific book in the order, with its
    quantity and price at the time of purchase. Multiple order items
    can belong to a single order.

    Attributes:
        id: Unique identifier for the order item
        order_id: Foreign key to the parent order
        book_id: Foreign key to the book being purchased
        quantity: Number of copies of the book ordered
        price: Price per copy of the book at time of purchase (5 digits, 2 decimal places)
    """

    __tablename__ = "order_item"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    order_id: int = Field(default=None, foreign_key="order.id", sa_type=BigInteger)
    book_id: int = Field(default=None, foreign_key="book.id", sa_type=BigInteger)
    quantity: int = Field(default=None, sa_type=SmallInteger)
    price: float = Field(default=None, sa_type=Numeric(5, 2))
