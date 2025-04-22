import os

from app.api.routes import api_router  # Import your API routes
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Path to frontend directory
frontend_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../frontend"),
)

# Mount static directories
app.mount(
    "/public",
    StaticFiles(directory=os.path.join(frontend_path, "public")),
    name="public",
)

app.mount("/src", StaticFiles(directory=os.path.join(frontend_path, "src")), name="src")


# Serve index.html for the root route
@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(frontend_path, "index.html"))


# Include your API routes
app.include_router(api_router)
