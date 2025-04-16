import os
from datetime import datetime, timedelta

from app.core.db_config import get_db
from app.db.user import User as UserModel
from app.schema.token import TokenData
from app.schema.user import UserInDB, UserInfoReturn
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
if not SECRET_KEY or not ALGORITHM or not ACCESS_TOKEN_EXPIRE_MINUTES:
    raise EnvironmentError(
        "Missing required environment variables: SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES",
    )
ACCESS_TOKEN_EXPIRE_MINUTES = int(ACCESS_TOKEN_EXPIRE_MINUTES)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compare a plain password with its hashed version."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate a hashed password for storage."""
    return pwd_context.hash(password)


def get_user(db: Session, email: str) -> UserInDB | None:
    """
    Retrieve a user from the database.
    Since the database uses the column 'password' for the hashed password,
    we assign it to the 'hashed_password' field in our Pydantic model.
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
    Retrieve a user from the database returning only public information.
    Uses get_user internally and strips out sensitive information.
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
    Verify that a user exists and that the provided password is correct.
    Returns the complete user record (including hashed password) upon successful
    authentication, otherwise returns False.
    """
    user = get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(
    data: UserInfoReturn,
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a JWT access token including the user's public information.
    Explicitly adds a 'sub' (subject) claim to the token payload.
    """
    # Convert the public user data to a dictionary
    to_encode = data.dict()
    # Add subject claim explicitly with the user email as unique identifier
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    Dependency for obtaining the current user from the JWT token.
    Decodes the token and retrieves user info from the database (without sensitive fields).
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
        token_data = TokenData(username=email)
    except JWTError:
        raise credentials_exception

    user = get_public_user(db, token_data.username)
    if user is None:
        raise credentials_exception
    return user
