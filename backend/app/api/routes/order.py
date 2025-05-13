"""
Order-related API endpoints and operations.

This module provides API routes for creating and managing customer orders.
It handles order creation, validation, and storage in the database.
"""

from datetime import datetime

from app.core.db_config import get_db
from app.db.order import Order
from app.db.order_item import OrderItem
from app.schemas.order import OrderListResponse, OrderRequest, OrderResponse
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
    """
    Create a new customer order with order items.

    This endpoint processes a customer order by:
    1. Validating the order has items
    2. Calculating the total order amount
    3. Creating the order record
    4. Creating individual order item records
    5. Committing the transaction

    Args:
        order (OrderRequest): Order data including user ID and order items
        db (Session): Database session dependency

    Returns:
        OrderResponse: Created order with its ID and details

    Raises:
        HTTPException: If order has no items (400) or other errors (500)
    """
    try:
        # Validate order details
        if not order.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No items in the order",
            )

        # Calculate total amount from all items
        total_amount = sum(
            float(item.quantity) * float(item.price) for item in order.items
        )

        # Create main order record
        new_order = Order(
            user_id=order.user_id,
            order_date=datetime.now(),
            order_total=total_amount,
        )

        # Save order to database
        db.add(new_order)
        db.flush()  # Get order ID without committing transaction

        # Create individual order item records
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


@router.get(
    "/get/{id}",
    response_model=OrderListResponse,
)
async def get_order_by_id(
    id: int,
    db: Session = Depends(get_db),
):
    try:
        result = OrderListResponse(orders=[])
        query = (
            db.query(
                Order,
            )
            .filter(Order.user_id == id)
            .order_by(Order.id.desc())
        )
        orders = query.all()
        for order in orders:
            temp = OrderResponse(
                id=order.id,
                user_id=order.user_id,
                order_date=order.order_date,
                order_total=order.order_total,
            )
            order_items = (
                db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
            )
            temp.items = order_items
            result.orders.append(temp)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}",
        )
