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
    "/styles",
    StaticFiles(directory=os.path.join(frontend_path, "styles")),
    name="styles",
)
app.mount(
    "/scripts",
    StaticFiles(directory=os.path.join(frontend_path, "scripts")),
    name="scripts",
)
app.mount("/src", StaticFiles(directory=os.path.join(frontend_path, "src")), name="src")
app.mount(
    "/static",
    StaticFiles(directory=os.path.join(frontend_path, "static")),
    name="static",
)


# Serve favicon.ico explicitly
@app.get("/favicon.ico")
async def favicon():
    return FileResponse(os.path.join(frontend_path, "static", "favicon", "favicon.ico"))


# Serve index.html for the root route
@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(frontend_path, "src", "index.html"))


# Include your API routes
app.include_router(api_router)
