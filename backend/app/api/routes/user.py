from app.core.auth import get_password_hash
from app.core.db_config import get_db
from app.db.user import User as UserModel
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

router = APIRouter(prefix="/user", tags=["user"])


class RegisterUserRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    admin: bool = False


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(request: RegisterUserRequest, db: Session = Depends(get_db)):
    # Check if any required field is None
    if not all(
        [request.email, request.password, request.first_name, request.last_name],
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="All fields (email, password, first_name, last_name) must be provided",
        )

    # Check if the user already exists
    existing_user = db.query(UserModel).filter(UserModel.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    # Hash the password
    hashed_password = get_password_hash(request.password)

    # Create a new user
    new_user = UserModel(
        email=request.email,
        password=hashed_password,
        first_name=request.first_name,
        last_name=request.last_name,
        admin=request.admin,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "user_id": new_user.id}


@router.post("/login")
def login_user():
    return {"message": "User login endpoint"}


@router.post("/logout")
def logout_user():
    return {"message": "User logout endpoint"}


@router.get("/get")
def get_users():
    return {"users": ["Alice", "Bob", "Charlie"]}
