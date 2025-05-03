from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ----- Base Schemas -----
class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    admin: bool = False


# ----- Schemas for Creation/Registration -----
class UserCreateBase(UserBase):
    password: str = Field(..., min_length=8)


class RegisterUserRequest(UserCreateBase):
    # Inherits all fields from UserCreateBase
    pass


# ----- Schemas for Reading -----
# Schema for returning user info (without password)
class UserRead(UserBase):
    class Config:
        from_attributes = True


# Schema used within token data or specific responses
class UserInfoReturn(UserBase):
    # Inherits fields from UserBase
    # Might add id here if needed in some contexts
    # id: int
    class Config:
        from_attributes = True


# ----- Schemas for Database Access -----
class UserInDB(UserBase):
    hashed_password: str

    class Config:
        from_attributes = True


# ----- Schemas for Login -----
class LoginUserRequest(BaseModel):
    email: EmailStr
    password: str
