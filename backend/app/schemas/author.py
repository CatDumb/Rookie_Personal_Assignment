from typing import Optional

from pydantic import BaseModel


# ----- Base Schema -----
class AuthorBase(BaseModel):
    author_name: str
    author_bio: Optional[str] = None


# ----- Read Schema -----
class AuthorRead(AuthorBase):
    id: int

    class Config:
        from_attributes = True


# ----- Create Schema (If needed in future) -----
# class AuthorCreate(AuthorBase):
#    pass
