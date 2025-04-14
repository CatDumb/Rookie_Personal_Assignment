from sqlmodel import SQLModel, Field
from sqlalchemy import BigInteger, Date, Numeric
from .base import Base

class Discount(Base, table=True):
    __tablename__ = "discount"
    
    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    book_id: int = Field(default=None, foreign_key="book.id", sa_type=BigInteger)
    discount_start_date: str = Field(default=None, sa_type=Date)
    discount_end_date: str = Field(default=None, sa_type=Date)
    discount_price: float = Field(default=None, sa_type=Numeric(5, 2))
