"""
Authentication and authorization module for the application.

This module provides functions for password hashing, user retrieval,
authentication, token generation, and validation. It implements JWT-based
authentication for securing API endpoints.
"""

import os
from datetime import datetime, timedelta

from app.core.db_config import get_db
from app.db.user import User as UserModel
from app.schemas.token import TokenData
from app.schemas.user import UserInDB, UserInfoReturn
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# Load environment variables from ../.env
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path)

# Retrieve and validate critical environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
REFRESH_TOKEN_EXPIRE_DAYS = int(
    os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"),
)  # Default 7 days
if not SECRET_KEY or not ALGORITHM or not ACCESS_TOKEN_EXPIRE_MINUTES:
    raise EnvironmentError(
        "Missing required environment variables: SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES",
    )
ACCESS_TOKEN_EXPIRE_MINUTES = int(ACCESS_TOKEN_EXPIRE_MINUTES)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compare a plain password with its hashed version.

    Args:
        plain_password: The plain text password to verify
        hashed_password: The bcrypt hashed password to compare against

    Returns:
        bool: True if the password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Generate a bcrypt hash for a plain text password.

    Args:
        password: The plain text password to hash

    Returns:
        str: The bcrypt hashed password
    """
    return pwd_context.hash(password)


def get_user(db: Session, email: str) -> UserInDB | None:
    """
    Retrieve a user from the database with sensitive information.

    Args:
        db: Database session
        email: User's email address to look up

    Returns:
        UserInDB: User object with hashed password if found
        None: If no user is found with the given email

    Notes:
        Maps the database 'password' column to the 'hashed_password' field in the Pydantic model.
    """
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if user:
        return UserInDB(
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            admin=user.admin,
            hashed_password=user.password,  # Mapping DB column 'password' to schema field 'hashed_password'
        )
    return None


def get_public_user(db: Session, email: str) -> UserInfoReturn | None:
    """
    Retrieve a user with only public information.

    Args:
        db: Database session
        email: User's email address to look up

    Returns:
        UserInfoReturn: User object without sensitive data if found
        None: If no user is found with the given email
    """
    user_in_db = get_user(db, email)
    if user_in_db:
        return UserInfoReturn(
            email=user_in_db.email,
            first_name=user_in_db.first_name,
            last_name=user_in_db.last_name,
            admin=user_in_db.admin,
        )
    return None


def authenticate_user(db: Session, email: str, password: str):
    """
    Authenticate a user with email and password.

    Args:
        db: Database session
        email: User's email address
        password: User's plain text password

    Returns:
        UserInDB: Complete user record if authentication succeeds
        False: If authentication fails (user not found or password incorrect)
    """
    user = get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(
    data: dict | UserInfoReturn,
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a JWT access token with user's public information.

    Args:
        data: User data to encode in the token
        expires_delta: Optional custom expiration time

    Returns:
        str: Encoded JWT access token

    Notes:
        Explicitly adds a 'sub' (subject) claim to identify the user.
    """
    # Convert the public user data to a dictionary if it's not already one
    if hasattr(data, "model_dump"):
        to_encode = data.model_dump()
    else:
        to_encode = data.copy()

    # Add subject claim explicitly with the user email as unique identifier
    if "sub" not in to_encode:
        to_encode["sub"] = to_encode.get("email")

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    data: dict | UserInfoReturn,
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a JWT refresh token with longer expiration time.

    Args:
        data: User data (only email is used)
        expires_delta: Optional custom expiration time

    Returns:
        str: Encoded JWT refresh token
    """
    # If it's a Pydantic model, get the email from it, otherwise from dict
    if hasattr(data, "email"):
        email = data.email
    else:
        email = data.get("email")

    to_encode = {"sub": email}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """
    Verify and decode a JWT token.

    Args:
        token: JWT token to verify

    Returns:
        dict: Token payload if valid

    Raises:
        HTTPException: If token is invalid (401 Unauthorized)
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    FastAPI dependency that extracts the current user from a JWT token.

    Args:
        token: JWT access token (extracted from Authorization header)
        db: Database session

    Returns:
        UserInfoReturn: Current authenticated user without sensitive data

    Raises:
        HTTPException: If token is invalid or user not found (401 Unauthorized)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # The 'sub' claim should contain the email address (unique user identifier)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = get_public_user(db, token_data.email)
    if user is None:
        raise credentials_exception
    return user
