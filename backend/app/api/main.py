"""
FastAPI application entry point that configures and starts the backend service.

This module sets up the FastAPI app with CORS middleware, static file mounts,
and includes all API routes. It serves the frontend application and API endpoints.
"""

import os

from app.api.routes import api_router  # Import your API routes
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # Allow specific origins for CORS requests
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://localhost:5173/",
        "http://127.0.0.1:5173/",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",  # Allow all origins (only for development!)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Locate and configure the path to the frontend directory
frontend_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../frontend"),
)

# Mount static directories from the frontend to serve assets
app.mount(
    "/public",
    StaticFiles(directory=os.path.join(frontend_path, "public")),
    name="public",
)

app.mount("/src", StaticFiles(directory=os.path.join(frontend_path, "src")), name="src")


@app.get("/")
async def serve_index():
    """
    Serve the frontend index.html file for the root route.

    Returns:
        FileResponse: The index.html file from the frontend directory
    """
    return FileResponse(os.path.join(frontend_path, "index.html"))


# Include all API routes from the router
app.include_router(api_router)
