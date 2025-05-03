"""User authentication and management endpoints."""

import logging

from app.core.auth import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    get_password_hash,
    get_user,
    verify_password,
    verify_token,
)
from app.core.db_config import get_db
from app.db.user import User as UserModel
from app.schemas.token import RefreshTokenRequest, Token
from app.schemas.user import LoginUserRequest, RegisterUserRequest, UserInfoReturn
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(request: RegisterUserRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.

    Args:
        request (RegisterUserRequest): User registration data including email, password, names
        db (Session): Database session dependency

    Returns:
        dict: Success message and authentication token

    Raises:
        HTTPException: If email already registered (409) or other errors (500)
    """
    try:
        # Check if the user already exists
        if get_user(db, request.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered",
            )

        # Hash the password
        hashed_password = get_password_hash(request.password)

        # Create a new user
        new_user = UserModel(
            email=request.email,
            password=hashed_password,  # Store hashed password in the 'password' column
            first_name=request.first_name,
            last_name=request.last_name,
            admin=request.admin,
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Create a public user model for the token data
        user_data = UserInfoReturn(
            email=new_user.email,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            admin=new_user.admin,
        )

        # Generate a new access token by passing the user data
        new_token = create_access_token(data=user_data)

        return {
            "message": "User registered successfully",
            "access_token": new_token,
            "token_type": "bearer",
        }

    except HTTPException:
        # Re-raise HTTP exceptions as they already have status codes
        raise
    except Exception as e:
        logger.error(f"Error during user registration: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user. Please try again later.",
        )


@router.post("/login", status_code=status.HTTP_200_OK)
async def login_user(request: LoginUserRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user and provide access tokens.

    Args:
        request (LoginUserRequest): User login credentials (email, password)
        db (Session): Database session dependency

    Returns:
        dict: Success message, access token, refresh token, and user information

    Raises:
        HTTPException: If account not registered (401), incorrect password (401),
                      or other errors (500)
    """
    try:
        # Fetch user record (get_user returns UserInDB with 'hashed_password' field)
        user = get_user(db, request.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is not registered",
            )

        # Verify the plain password against the 'hashed_password' field from the UserInDB schema
        if not verify_password(request.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
            )

        user_data = UserInfoReturn(
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            admin=user.admin,
        )

        # Generate a new token by passing the public user model directly
        access_token = create_access_token(data=user_data)
        refresh_token = create_refresh_token(data=user_data)

        return {
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "last_name": user.last_name,
            "first_name": user.first_name,
        }

    except HTTPException:
        # Re-raise HTTP exceptions as they already have status codes
        raise
    except Exception as e:
        logger.error(f"Error during user login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed due to a system error. Please try again later.",
        )


@router.post("/refresh-token", status_code=status.HTTP_200_OK, response_model=Token)
async def refresh_access_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """
    Generate a new access token using a valid refresh token.

    Args:
        request (RefreshTokenRequest): Refresh token data
        db (Session): Database session dependency

    Returns:
        dict: New access token and token type

    Raises:
        HTTPException: If invalid refresh token (401), user not found (401),
                      or other errors (500)
    """
    try:
        # Verify the refresh token
        payload = verify_token(request.refresh_token)
        email = payload.get("sub")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        # Get the user from the database
        user = get_user(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        # Create new user data model
        user_data = UserInfoReturn(
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            admin=user.admin,
        )

        # Generate a new access token
        new_access_token = create_access_token(data=user_data)

        # Return structure should match Token schema
        return Token(
            access_token=new_access_token,
            token_type="bearer",
            # refresh_token is not returned here
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed due to a system error. Please try again later.",
        )


@router.post("/logout")
def logout_user():
    """
    Endpoint for user logout.

    Note: Currently a placeholder, actual implementation would involve token revocation.

    Returns:
        dict: Success message

    Raises:
        HTTPException: If there's an error during logout (500)
    """
    try:
        # Note: Actual logout functionality often involves token revocation mechanisms.
        return {"message": "User logout endpoint"}
    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed. Please try again later.",
        )


@router.get("/profile", status_code=status.HTTP_200_OK)
async def get_user_profile(
    current_user: UserInfoReturn = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the current user's profile information including their ID.

    Args:
        current_user (UserInfoReturn): Current authenticated user
        db (Session): Database session dependency

    Returns:
        dict: User profile information including ID

    Raises:
        HTTPException: If user is not found (404) or other errors (500)
    """
    try:
        # Get the full user data from the database
        user = db.query(UserModel).filter(UserModel.email == current_user.email).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Return the user data including ID
        return {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "admin": user.admin,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile. Please try again later.",
        )
