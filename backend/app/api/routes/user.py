import logging

from app.core.auth import (
    create_access_token,
    get_password_hash,
    get_user,
    verify_password,
)
from app.core.db_config import get_db
from app.db.user import User as UserModel
from app.schema.user import LoginUserRequest, RegisterUserRequest, UserInfoReturn
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(request: RegisterUserRequest, db: Session = Depends(get_db)):
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

        # Create a public user model for the response
        user_data = UserInfoReturn(
            email=new_user.email,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            admin=new_user.admin,
        )

        # Generate a new token by passing the public user model directly
        new_token = create_access_token(data=user_data)

        return {"message": "User registered successfully", "token": new_token}

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
    try:
        # Fetch user record (returns a UserInDB instance with hashed password from 'password' column)
        user = get_user(db, request.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is not registered",
            )

        # Verify the password using the hashed password stored in the 'password' column
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
        new_token = create_access_token(data=user_data)

        return {
            "message": "Login successful",
            "access_token": new_token,
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


@router.post("/logout")
def logout_user():
    try:
        # Note: Actual logout functionality often involves token revocation mechanisms.
        return {"message": "User logout endpoint"}
    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed. Please try again later.",
        )
