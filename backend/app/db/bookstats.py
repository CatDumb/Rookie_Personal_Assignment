from sqlalchemy import BigInteger, Float, Integer
from sqlmodel import Field

from .base import Base


class BookStats(Base, table=True):
    __tablename__ = "book_stats"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    review_count: int = Field(default=0, sa_type=Integer)
    total_star: int = Field(default=0, sa_type=Integer)
    avg_rating: float = Field(default=0.0, sa_type=Float)
    lowest_price: float = Field(default=0.0, sa_type=Float)
