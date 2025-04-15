from sqlalchemy import BigInteger, Boolean
from sqlmodel import Field

from .base import Base


class User(Base, table=True):
    __tablename__ = "user"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    first_name: str = Field(default=None, max_length=50)
    last_name: str = Field(default=None, max_length=50)
    email: str = Field(default=None, max_length=70)
    password: str = Field(default=None, max_length=255)
    admin: bool = Field(default=False, sa_type=Boolean)
