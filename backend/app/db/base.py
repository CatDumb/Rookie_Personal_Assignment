from sqlmodel import SQLModel, Field

class Base(SQLModel, table=False):
    pass