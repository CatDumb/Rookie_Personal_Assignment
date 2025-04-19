import os

from app.api.routes import api_router  # Import your API routes
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

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
