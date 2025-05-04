"""
Token-related Pydantic schemas for authentication.

This module defines the data models for authentication tokens
including access tokens, refresh tokens, and token data.
"""

from typing import Optional

from pydantic import BaseModel


class Token(BaseModel):
    """
    Schema for token response returned to clients after authentication.

    Attributes:
        access_token: JWT access token for authorization
        refresh_token: Optional JWT refresh token to obtain new access tokens
        token_type: Token type, typically "bearer"
    """

    access_token: str
    refresh_token: Optional[str] = None  # Include refresh token during login
    token_type: str


class TokenData(BaseModel):
    """
    Schema for decoded token payload data.

    Attributes:
        email: User's email extracted from the token subject claim
    """

    email: Optional[str] = None
    # Add other identifier fields if needed, e.g., user_id


class RefreshTokenRequest(BaseModel):
    """
    Schema for refresh token requests to obtain new access tokens.

    Attributes:
        refresh_token: Valid refresh token previously issued
    """

    refresh_token: str
