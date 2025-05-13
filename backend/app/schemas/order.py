"""
Order-related Pydantic schemas for API request/response handling.

This module defines the data models for order operations including
order creation, order item management, and order retrieval.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# ----- Order Item Schemas -----
class OrderItemBase(BaseModel):
    """
    Base schema for order items within a customer order.

    Represents a single book in an order with its quantity and price.

    Attributes:
        book_id: ID of the book being ordered
        quantity: Number of copies ordered
        price: Price per copy at the time of order (may differ from current book price)
    """

    book_id: int
    quantity: int
    price: float  # Price at the time of order


class OrderItemCreate(OrderItemBase):
    """
    Schema for creating a new order item.

    Currently inherits all fields from OrderItemBase without modifications.
    """

    pass


class OrderItemRead(OrderItemBase):
    """
    Schema for retrieving order item information.

    Extends OrderItemBase with identifiers for the item and its parent order.

    Attributes:
        id: Unique identifier for the order item
        order_id: ID of the parent order
    """

    id: int
    order_id: int

    class Config:
        from_attributes = True


# ----- Order Schemas -----
class OrderBase(BaseModel):
    """
    Base schema with common order attributes.

    Contains order metadata fields, most of which are handled server-side.

    Attributes:
        order_date: Optional timestamp when the order was placed
        order_total: Optional total monetary amount of the order
    """

    # user_id will likely come from the authenticated user context, not request body
    # user_id: int
    order_date: Optional[datetime] = None  # Set by server
    order_total: Optional[float] = None  # Calculated by server


class OrderCreate(OrderBase):
    """
    Schema for creating a new order.

    Extends OrderBase with the list of items to be ordered and user identification.

    Attributes:
        items: List of order items to be created
        user_id: ID of the user placing the order
    """

    items: List[OrderItemCreate]
    user_id: int  # Required for creation logic in route


class OrderRequest(OrderCreate):
    """
    Schema for order creation request.

    Explicitly named to match the route handler parameter.
    Currently inherits all fields from OrderCreate without modifications.
    """

    # Explicitly match the name used in the route
    pass


class OrderRead(OrderBase):
    """
    Schema for retrieving complete order information.

    Extends OrderBase with order identifiers and nested order items.

    Attributes:
        id: Unique identifier for the order
        user_id: ID of the user who placed the order
        order_date: Timestamp when the order was placed
        order_total: Total monetary amount of the order
        items: List of order items belonging to this order
    """

    id: int
    user_id: int
    order_date: datetime
    order_total: float
    items: List[OrderItemRead] = []  # Include order items when reading an order

    class Config:
        from_attributes = True


class OrderResponse(OrderRead):
    """
    Schema for order creation/retrieval response.

    Explicitly named to match the route response model.
    Currently inherits all fields from OrderRead without modifications.
    """

    # Explicitly match the name used in the route
    pass


class OrderListResponse(BaseModel):
    """
    Schema for listing multiple orders.

    Extends OrderResponse with a list of orders and pagination metadata.

    Attributes:
        orders: List of orders
    """

    orders: List[OrderResponse]
