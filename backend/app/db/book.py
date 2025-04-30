from typing import Optional

from sqlalchemy import BigInteger, Numeric
from sqlmodel import Field

from .base import Base


class Book(Base, table=True):
    __tablename__ = "book"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)

    category_id: int = Field(
        default=None,
        foreign_key="category.id",
        sa_type=BigInteger,
    )
    author_id: int = Field(default=None, foreign_key="author.id", sa_type=BigInteger)
    book_title: str = Field(default=None, max_length=255)
    book_summary: str = Field(default=None)
    book_price: float = Field(default=None, sa_type=Numeric(5, 2))
    book_cover_photo: Optional[str] = Field(default=None, max_length=40)
