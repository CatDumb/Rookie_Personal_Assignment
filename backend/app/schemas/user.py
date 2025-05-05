"""
User-related Pydantic schemas for API request/response handling.

This module defines the data models for user operations including
registration, authentication, and profile information retrieval.
"""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ----- Base Schemas -----
class UserBase(BaseModel):
    """
    Base schema with common user attributes.

    Contains the essential fields that represent a user account.

    Attributes:
        id: User's unique identifier
        email: User's email address (used as unique identifier)
        first_name: Optional first name
        last_name: Optional last name
        admin: Whether the user has administrative privileges
    """

    id: Optional[int] = None
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    admin: bool = False


# ----- Schemas for Creation/Registration -----
class UserCreateBase(UserBase):
    """
    Base schema for user creation with password.

    Extends UserBase to include a password field for registration.

    Attributes:
        password: Plain text password (must be at least 8 characters)
    """

    password: str = Field(..., min_length=8)


class RegisterUserRequest(UserCreateBase):
    """
    Schema for user registration request.

    Named to match the route handler parameter.
    Currently inherits all fields from UserCreateBase without modifications.
    """

    # Inherits all fields from UserCreateBase
    pass


# ----- Schemas for Reading -----
# Schema for returning user info (without password)
class UserRead(UserBase):
    """
    Schema for reading user information.

    Provides user data without sensitive information like passwords.
    """

    class Config:
        from_attributes = True


# Schema used within token data or specific responses
class UserInfoReturn(UserBase):
    """
    Schema for user information in API responses and tokens.

    Contains public user profile information suitable for inclusion
    in JWT tokens and API responses.
    """

    # Inherits fields from UserBase including id
    class Config:
        from_attributes = True


# ----- Schemas for Database Access -----
class UserInDB(UserBase):
    """
    Schema for internal database user representation.

    Used for internal operations requiring the hashed password.
    This schema should never be returned directly in API responses.

    Attributes:
        hashed_password: Bcrypt hashed password from the database
    """

    hashed_password: str

    class Config:
        from_attributes = True


# ----- Schemas for Login -----
class LoginUserRequest(BaseModel):
    """
    Schema for user login request.

    Contains the minimal fields needed for authentication.

    Attributes:
        email: User's email address
        password: Plain text password for verification
    """

    email: EmailStr
    password: str
