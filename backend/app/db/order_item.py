from sqlalchemy import BigInteger, Numeric, SmallInteger
from sqlmodel import Field

from .base import Base


class OrderItem(Base, table=True):
    __tablename__ = "order_item"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    order_id: int = Field(default=None, foreign_key="order.id", sa_type=BigInteger)
    book_id: int = Field(default=None, foreign_key="book.id", sa_type=BigInteger)
    quantity: int = Field(default=None, sa_type=SmallInteger)
    price: float = Field(default=None, sa_type=Numeric(5, 2))
