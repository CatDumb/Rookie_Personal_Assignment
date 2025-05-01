"""
Python script to wipe all data tables from your SQLModel/PostgreSQL database.

Usage:
  1. Set your DATABASE_URL in .env file, e.g.: DATABASE_URL="postgresql://user:pass@localhost:5432/yourdb"
  2. python database_wipe.py
"""

import os
import sys
from datetime import date, datetime

from dotenv import load_dotenv
from sqlalchemy import text  # Add import for text SQL
from sqlmodel import Field, Session, SQLModel, create_engine

# Load environment variables from .env file
load_dotenv()


# --------------------
# Define your models
# --------------------
class Author(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    author_name: str
    author_bio: str


class Category(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    category_name: str
    category_desc: str


class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    first_name: str
    last_name: str
    email: str
    password: str
    admin: bool


class Book(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    category_id: int
    author_id: int
    book_title: str
    book_summary: str
    book_price: float
    book_cover_photo: str


class Discount(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    book_id: int
    discount_start_date: date
    discount_end_date: date
    discount_price: float


class Order(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: int
    order_date: datetime
    order_total: float


class OrderItem(SQLModel, table=True):
    __tablename__ = "order_item"
    id: int = Field(default=None, primary_key=True)
    order_id: int
    book_id: int
    quantity: int
    price: float


class Review(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    book_id: int
    review_title: str
    review_details: str
    review_date: datetime
    rating_star: int


class BookStats(SQLModel, table=True):
    __tablename__ = "book_stats"
    id: int = Field(default=None, primary_key=True)
    review_count: int
    total_star: int
    avg_rating: float
    lowest_price: float


# --------------------
# Setup
# --------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise SystemExit(
        "Error: DATABASE_URL not found in environment variables or .env file.",
    )

# Connect to the database
engine = create_engine(DATABASE_URL)


def wipe_database():
    """Drop all tables in the database - in reverse order to handle dependencies."""
    print("⚠️ This will delete ALL data in the following tables:")
    tables = [
        "book_stats",
        "review",
        "order_item",
        "order",
        "discount",
        "book",
        "user",
        "category",
        "author",
    ]

    for table in tables:
        print(f"  - {table}")

    confirmation = input(
        "\n⚠️ Are you sure you want to continue? (type 'YES' to confirm): ",
    )

    if confirmation != "YES":
        print("Database wipe cancelled.")
        sys.exit(0)

    print("\nWiping database...")
    with Session(engine) as session:
        # Drop tables in reverse dependency order
        for table in tables:
            # Put table names in quotes to handle reserved keywords like "order"
            session.exec(text(f'TRUNCATE TABLE "{table}" CASCADE'))

            # Reset the auto-increment sequence for each table
            # This ensures new IDs start from 1 again
            session.exec(text(f'ALTER SEQUENCE "{table}_id_seq" RESTART WITH 1'))

        session.commit()

    print("✅ Database wiped successfully!")


if __name__ == "__main__":
    wipe_database()
