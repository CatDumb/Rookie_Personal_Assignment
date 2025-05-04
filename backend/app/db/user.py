"""
User database model for storing user account information.

This module defines the SQLModel for the User table, which represents
registered users in the bookstore system with their credentials and roles.
"""

from sqlalchemy import BigInteger, Boolean
from sqlmodel import Field

from .base import Base


class User(Base, table=True):
    """
    Database model representing a registered user in the bookstore system.

    Users can browse books, write reviews, place orders, and have different
    privilege levels (regular user or admin).

    Attributes:
        id: Unique identifier for the user
        first_name: User's first name (max 50 characters)
        last_name: User's last name (max 50 characters)
        email: User's email address, used for login (max 70 characters)
        password: Bcrypt hashed password (max 255 characters)
        admin: Whether the user has administrative privileges
    """

    __tablename__ = "user"

    id: int = Field(default=None, primary_key=True, sa_type=BigInteger)
    first_name: str = Field(default=None, max_length=50)
    last_name: str = Field(default=None, max_length=50)
    email: str = Field(default=None, max_length=70)
    password: str = Field(default=None, max_length=255)
    admin: bool = Field(default=False, sa_type=Boolean)
