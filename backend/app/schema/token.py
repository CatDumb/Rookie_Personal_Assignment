from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str = None


class TokenData(BaseModel):
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str
