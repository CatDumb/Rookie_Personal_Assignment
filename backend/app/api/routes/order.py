"""Order-related API endpoints and operations."""

from datetime import datetime

from app.core.db_config import get_db
from app.db.order import Order
from app.db.order_item import OrderItem
from app.schemas.order import OrderRequest, OrderResponse
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/order",
    tags=["order"],
)


@router.post(
    "/create",
    status_code=status.HTTP_201_CREATED,
    response_model=OrderResponse,
)
async def create_order(
    order: OrderRequest,
    db: Session = Depends(get_db),
):
    """Create a new order."""
    try:
        # Validate order details
        if not order.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No items in the order",
            )

        # Calculate total amount
        total_amount = sum(
            float(item.quantity) * float(item.price) for item in order.items
        )

        # Create order
        new_order = Order(
            user_id=order.user_id,
            order_date=datetime.now(),
            order_total=total_amount,
        )

        # Save order to database
        db.add(new_order)
        db.flush()

        # Create order items
        order_items_db = []
        for item in order.items:
            order_item = OrderItem(
                order_id=new_order.id,
                book_id=item.book_id,
                quantity=item.quantity,
                price=item.price,
            )
            order_items_db.append(order_item)
            db.add(order_item)

        db.commit()
        db.refresh(new_order)

        return new_order

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}",
        )
