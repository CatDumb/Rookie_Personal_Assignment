"""
Base database model definition for SQLModel.

This module defines the Base class that all database models will inherit from,
providing consistent SQLModel configuration across the application.
"""

from sqlmodel import SQLModel


class Base(SQLModel, table=False):
    """
    Base model class for all database models.

    This class inherits from SQLModel with table=False to allow it to be
    used as a base class for both table models and non-table models.
    All database entity models should inherit from this class.
    """

    pass
