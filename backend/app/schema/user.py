# app/schemas/user.py
from pydantic import BaseModel, EmailStr


class LoginUserRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterUserRequest(LoginUserRequest):
    first_name: str
    last_name: str
    admin: bool = False


class UserInfoReturn(BaseModel):
    email: str
    first_name: str
    last_name: str
    admin: bool


class UserInDB(UserInfoReturn):
    hashed_password: str
