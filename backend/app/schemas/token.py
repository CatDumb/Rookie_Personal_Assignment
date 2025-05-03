from typing import Optional

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None  # Include refresh token during login
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
    # Add other identifier fields if needed, e.g., user_id


class RefreshTokenRequest(BaseModel):
    refresh_token: str
