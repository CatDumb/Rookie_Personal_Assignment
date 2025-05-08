"""
FastAPI application entry point that configures and starts the backend service.

This module sets up the FastAPI app with CORS middleware and includes all API routes.
It serves API endpoints only, while the frontend is served by a separate service.
"""

from app.api.routes import api_router  # Import your API routes
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # Allow specific origins for CORS requests
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://frontend:5173",
        "http://localhost:5173/",
        "http://127.0.0.1:5173/",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:80",
        "http://localhost",
        "http://frontend",
        "*",  # Allow all origins (only for development!)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include all API routes from the router
app.include_router(api_router)
