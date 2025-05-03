from typing import Optional

from pydantic import BaseModel


# ----- Base Schema -----
class CategoryBase(BaseModel):
    category_name: str
    category_desc: Optional[str] = None


# ----- Read Schema -----
class CategoryRead(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# ----- Create Schema (If needed in future) -----
# class CategoryCreate(CategoryBase):
#    pass
