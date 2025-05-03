from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# ----- Order Item Schemas -----
class OrderItemBase(BaseModel):
    book_id: int
    quantity: int
    price: float  # Price at the time of order


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemRead(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True


# ----- Order Schemas -----
class OrderBase(BaseModel):
    # user_id will likely come from the authenticated user context, not request body
    # user_id: int
    order_date: Optional[datetime] = None  # Set by server
    order_total: Optional[float] = None  # Calculated by server


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]
    user_id: int  # Required for creation logic in route


class OrderRequest(OrderCreate):
    # Explicitly match the name used in the route
    pass


class OrderRead(OrderBase):
    id: int
    user_id: int
    order_date: datetime
    order_total: float
    items: List[OrderItemRead] = []  # Include order items when reading an order

    class Config:
        from_attributes = True


class OrderResponse(OrderRead):
    # Explicitly match the name used in the route
    pass
