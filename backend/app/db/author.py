from sqlmodel import SQLModel, Field
from sqlalchemy import BigInteger
from .base import Base

class Author(Base, table=True):
    __tablename__ = "author"
    
    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    author_name: str = Field(default=None, max_length=255)
    author_bio: str = Field(default=None)