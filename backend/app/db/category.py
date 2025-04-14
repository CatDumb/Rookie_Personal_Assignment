from sqlmodel import SQLModel, Field
from sqlalchemy import BigInteger
from .base import Base

class Category(Base, table=True):
    __tablename__ = 'category'

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    category_name: str = Field(default=None, max_length=120)
    category_desc: str = Field(default=None, max_length=255)