from pathlib import Path

from app.api.routes import api_router
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Mount the frontend directory to serve static files
frontend_path = Path(__file__).parent.parent.parent.parent / "frontend"
app.mount("/frontend", StaticFiles(directory=frontend_path, html=True), name="frontend")

app.include_router(api_router, prefix="/api", tags=["api"])


@app.get("/")
def read_index():
    return FileResponse(frontend_path / "index.html")
