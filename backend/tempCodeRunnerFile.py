"""
Python script to generate and inject fake data into your SQLModel/PostgreSQL database using Faker.

Usage:
  1. Set your DATABASE_URL in .env file, e.g.: DATABASE_URL="postgresql://user:pass@localhost:5432/yourdb"
  2. pip install sqlmodel psycopg2-binary faker python-dotenv
  3. python dataseed.py
"""

import os
import random
from datetime import date, datetime, timedelta  # include date

from dotenv import load_dotenv
from faker import Faker
from passlib.context import CryptContext  # Add this for password hashing
from sqlalchemy import text  # Add this import for text SQL
from sqlmodel import Field, Session, SQLModel, create_engine

# Load environment variables from .env file
load_dotenv()

# Setup password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Generate a hashed password for storage."""
    return pwd_context.hash(password)


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
    discount_start_date: date  # use date type
    discount_end_date: date  # use date type
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
    rating_star: int  # Fixed: changed from rating_start to rating_star


class BookStats(SQLModel, table=True):
    __tablename__ = "book_stats"
    id: int = Field(default=None, primary_key=True)
    review_count: int
    total_star: int
    avg_rating: float
    lowest_price: float  # Price after considering discounts


# --------------------
# Setup
# --------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise SystemExit(
        "Error: DATABASE_URL not found in environment variables or .env file.",
    )

# Connect to the existing database without recreating tables
engine = create_engine(DATABASE_URL)

# Create a Faker instance for data generation
faker = Faker()

# --------------------
# Data generation
# --------------------
with Session(engine) as session:
    # Authors
    authors = []
    for _ in range(20):
        a = Author(author_name=faker.name(), author_bio=faker.text(max_nb_chars=200))
        session.add(a)
        authors.append(a)
    session.commit()

    # Categories
    categories = []
    for name in [faker.word().title() for _ in range(20)]:
        c = Category(category_name=name, category_desc=faker.sentence())
        session.add(c)
        categories.append(c)
    session.commit()

    # Users
    users = []
    for _ in range(20):
        plain_password = "string"
        hashed_password = get_password_hash(plain_password)  # Hash the password
        u = User(
            first_name=faker.first_name(),
            last_name=faker.last_name(),
            email=faker.unique.email(),
            password=hashed_password,  # Store the hashed password
            admin=faker.boolean(chance_of_getting_true=10),
        )
        session.add(u)
        users.append(u)
    session.commit()

    # Books
    books = []
    for _ in range(100):
        title = faker.sentence(nb_words=4).rstrip(".")
        price = round(random.uniform(5, 100), 2)
        photo = faker.file_name(extension="jpg")[:20]
        b = Book(
            category_id=random.choice(categories).id,
            author_id=random.choice(authors).id,
            book_title=title,
            book_summary=faker.paragraph(),
            book_price=price,
            book_cover_photo=photo,
        )
        session.add(b)
        books.append(b)
    session.commit()

    # Discounts (for ~30% of books)
    for book in random.sample(books, k=int(len(books) * 0.3)):
        start = faker.date_between(start_date="-30d", end_date="today")
        end = start + timedelta(days=random.randint(5, 30))
        d = Discount(
            book_id=book.id,
            discount_start_date=start,
            discount_end_date=end,
            discount_price=round(book.book_price * random.uniform(0.5, 0.9), 2),
        )
        session.add(d)
    session.commit()

    # Orders & OrderItems
    orders = []
    for _ in range(50):
        user = random.choice(users)
        order_date = faker.date_time_between(start_date="-30d", end_date="now")
        o = Order(user_id=user.id, order_date=order_date, order_total=0)
        session.add(o)
        orders.append(o)
    session.commit()

    # Order items and update order total
    for o in orders:
        items = random.randint(1, 5)
        total = 0
        for _ in range(items):
            book = random.choice(books)
            qty = random.randint(1, 3)
            price = book.book_price
            oi = OrderItem(order_id=o.id, book_id=book.id, quantity=qty, price=price)
            session.add(oi)
            total += price * qty
        o.order_total = round(total, 2)
    session.commit()

    # Reviews
    for book in books:
        for _ in range(random.randint(0, 5)):
            # Ensure rating_star is an integer between 1-5
            rating = random.randint(1, 5)
            r = Review(
                book_id=book.id,
                review_title=faker.sentence(nb_words=3),
                review_details=faker.paragraph(),
                review_date=faker.date_time_between(start_date="-30d", end_date="now"),
                rating_star=rating,
            )
            session.add(r)
    session.commit()

    # BookStats
    for book in books:
        # Get review count and star data
        review_query = text("""
            SELECT COUNT(id) as review_count,
            COALESCE(SUM(rating_star), 0) as total_star,
            CASE
                WHEN COUNT(id) > 0 THEN COALESCE(AVG(rating_star), 0)
                ELSE 0
            END as avg_rating
            FROM review WHERE book_id = :book_id
        """)
        review_stats = session.exec(review_query, params={"book_id": book.id}).one()

        # Get valid discount price if exists
        discount_query = text("""
            SELECT discount_price FROM discount
            WHERE book_id = :book_id
            AND CURRENT_DATE BETWEEN discount_start_date AND discount_end_date
            ORDER BY discount_price ASC LIMIT 1
        """)
        discount_result = session.exec(
            discount_query,
            params={"book_id": book.id},
        ).first()

        # Determine lowest price - either original price or discount if available
        lowest_price = (
            discount_result.discount_price if discount_result else book.book_price
        )

        bs = BookStats(
            id=book.id,  # This links book_stats.id to book.id
            review_count=review_stats.review_count,
            total_star=int(review_stats.total_star),  # Store the total star count
            avg_rating=float(review_stats.avg_rating),  # This is calculated in SQL
            lowest_price=float(lowest_price),
        )
        session.add(bs)
    session.commit()

print("✅ Finished seeding database with Faker!")
