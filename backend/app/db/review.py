from typing import Optional

from sqlalchemy import TIMESTAMP, BigInteger
from sqlmodel import Field

from .base import Base


class Review(Base, table=True):
    __tablename__ = "review"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    book_id: int = Field(default=None, foreign_key="book.id", sa_type=BigInteger)
    review_title: str = Field(default=None, max_length=120)
    review_details: Optional[str] = Field(default=None)
    review_date: str = Field(default=None, sa_type=TIMESTAMP)
    rating_star: int = Field(default=None, le=1, ge=5)
