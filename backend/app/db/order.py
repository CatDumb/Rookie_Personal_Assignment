from sqlalchemy import TIMESTAMP, BigInteger, Numeric
from sqlmodel import Field

from .base import Base


class Order(Base, table=True):
    __tablename__ = "order"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    user_id: int = Field(default=None, foreign_key="user.id", sa_type=BigInteger)
    order_date: str = Field(default=None, sa_type=TIMESTAMP)
    order_total: float = Field(default=None, sa_type=Numeric(8, 2))
