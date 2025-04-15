import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# Load environment variables from the .env file in the root directory
load_dotenv(
    dotenv_path=os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        ".env",
    ),
)

# Validate database URL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError(
        f"DATABASE_URL not found! Current working directory: {os.getcwd()}",
    )


if not DATABASE_URL.startswith("postgresql://"):
    raise ValueError("Invalid database URL format. Use postgresql://")

# Configure sync engine with connection pool
engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

session_factory = sessionmaker(bind=engine, class_=Session, expire_on_commit=False)


def get_db():
    with session_factory() as session:
        yield session
