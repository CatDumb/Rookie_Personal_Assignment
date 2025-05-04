"""
Database configuration module for SQLAlchemy connection.

This module configures the SQLAlchemy database engine, connection pool,
and session factory. It provides a dependency for FastAPI to manage
database sessions throughout request-response lifecycle.
"""

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

# Configure sync engine with connection pool settings for optimal performance
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Log SQL queries (set to False in production)
    pool_size=10,  # Base number of connections to maintain
    max_overflow=20,  # Maximum number of connections above pool_size
    pool_pre_ping=True,  # Verify connections before usage to avoid stale connections
)

# Create session factory with expire_on_commit=False to allow object usage after commit
session_factory = sessionmaker(bind=engine, class_=Session, expire_on_commit=False)


def get_db():
    """
    FastAPI dependency that provides a database session.

    This function creates a new SQLAlchemy Session instance for each request
    and automatically closes it when the request is finished.

    Yields:
        Session: SQLAlchemy database session
    """
    with session_factory() as session:
        yield session
