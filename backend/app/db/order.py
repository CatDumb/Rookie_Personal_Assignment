"""
Order database model for storing customer order information.

This module defines the SQLModel for the Order table, which represents
customer purchase orders with total amount and creation date.
"""

from sqlalchemy import TIMESTAMP, BigInteger, Numeric
from sqlmodel import Field

from .base import Base


class Order(Base, table=True):
    """
    Database model representing a customer order in the bookstore.

    An order is created when a customer purchases books and contains the
    order date and total amount. Detailed order line items are stored in
    the related OrderItem table.

    Attributes:
        id: Unique identifier for the order
        user_id: Foreign key to the user who placed the order
        order_date: Timestamp when the order was placed
        order_total: Total monetary amount of the order (8 digits, 2 decimal places)
    """

    __tablename__ = "order"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    user_id: int = Field(default=None, foreign_key="user.id", sa_type=BigInteger)
    order_date: str = Field(default=None, sa_type=TIMESTAMP)
    order_total: float = Field(default=None, sa_type=Numeric(8, 2))
