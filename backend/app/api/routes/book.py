from fastapi import APIRouter

router = APIRouter(
    prefix="/book",
    tags=["book"],
)  # Add a prefix for all routes in this router


@router.post("/")
def list_books():
    """Paginated list of books"""
    return {"message": "Paginated list of books"}


@router.get("/{book_id}")
def get_book_by_id():
    """Get book by ID"""
    return {"book": ["name", "page"]}


@router.get("/on_sale")
def get_books_on_sale():
    """Return top 10 on sale books"""
    return {"book": ["name", "page"]}


@router.get("/featured/recommended")
def get_recommended_books():
    """Return top 8 recommended books"""
    return {"book": ["name", "page"]}


@router.get("/featured/popular")
def get_popular_books():
    """Return top 8 popular books"""
    return {"book": ["name", "page"]}
