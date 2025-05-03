from app.schemas.base import ItemsResponse
from pydantic import BaseModel


# ----- Schema for Book Stats -----
class BookStats(BaseModel):
    review_count: int
    avg_rating: float
    star_5: int
    star_4: int
    star_3: int
    star_2: int
    star_1: int


class BookStatsResponse(ItemsResponse[BookStats]):
    pass
