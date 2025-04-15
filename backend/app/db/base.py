from sqlmodel import SQLModel


class Base(SQLModel, table=False):
    pass
