import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles


class StrictMIMEStaticFiles(StaticFiles):
    """Enforce correct MIME types for all common web files"""

    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)

        # Map file extensions to correct MIME types
        mime_types = {
            ".js": "application/javascript",  # Correct MIME type for JavaScript modules
            ".css": "text/css",
            ".svg": "image/svg+xml",
            ".html": "text/html",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".woff2": "font/woff2",
        }

        ext = os.path.splitext(path)[1]
        if ext in mime_types:
            response.headers["Content-Type"] = mime_types[ext]

        return response


app = FastAPI(title="Rookie Personal Assignment")

# Path configuration
current_file = Path(__file__).resolve()
frontend_dir = current_file.parent.parent.parent.parent / "frontend"

# Mount static files
app.mount(
    "/",
    StrictMIMEStaticFiles(directory=str(frontend_dir), html=True, check_dir=True),
    name="frontend",
)
