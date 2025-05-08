# Docker Setup for Full Stack Application

This project uses Docker to containerize the frontend, backend, and database services. Follow these instructions to get started.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git to clone the repository

## Project Structure

```
project-root/
├── frontend/             # React/Vite frontend application
│   └── Dockerfile        # Frontend Dockerfile for development
├── backend/              # FastAPI backend application
│   ├── Dockerfile        # Backend Dockerfile
│   └── entrypoint.sh     # Script to handle database setup and application startup
└── docker-compose.yml    # Docker Compose configuration for all services
```

## Services

- **Frontend**: React app running in development mode on port 5173
- **Backend**: FastAPI application on port 8000
- **Database**: PostgreSQL database on port 5432

## Automatic Database Setup

The backend service uses an entrypoint script (`entrypoint.sh`) that automatically:
1. Waits for the database to be ready
2. Runs database migrations
3. Seeds the database (only on first run)
4. Starts the application

This ensures that your database is always properly set up when you start the services.

## Usage

1. **Start the application stack**:
   ```bash
   docker-compose up -d
   ```
   This will build and start all services, including database initialization.

2. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Database: postgresql://postgres:password@localhost:5432/app

3. **View logs**:
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f database
   ```

4. **Rebuild images** (after making changes):
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

5. **Stop the services**:
   ```bash
   docker-compose down
   ```

   To stop and remove volumes (will delete database data and cause re-seeding on next startup):
   ```bash
   docker-compose down -v
   ```

## Development Workflow

For development, you can use the volume mounts to reflect code changes without rebuilding:

- Backend code changes will be reflected automatically due to the volume mount and uvicorn's reload flag.
- Frontend code changes will be reflected automatically due to the volume mount and Vite's hot module replacement.
- Database data is persisted in a named volume `postgres_data`

## Database Management

- **Connection details**:
  - Host: localhost (outside Docker) or database (inside Docker network)
  - Port: 5432
  - Username: postgres
  - Password: password
  - Database: app

- **Connect with psql** (requires PostgreSQL client tools):
  ```bash
  psql -h localhost -U postgres -d app
  ```

- **Database persistence**: Data is stored in a Docker volume named `postgres_data` and will persist between container restarts.

## Manual Database Operations (if needed)

While database setup is automatic, you can still run these commands manually if needed:

1. Run migrations manually:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

2. Seed data manually:
   ```bash
   docker-compose exec backend python dataseed.py
   ```

3. Reset the seed flag (to force re-seeding on next start):
   ```bash
   docker-compose exec backend rm -f /app/.db_seeded
   ```

## Troubleshooting

- **Backend can't access frontend**: Check the CORS configuration in `backend/app/api/main.py`
- **Frontend can't access backend API**: Check API URLs in frontend code to ensure they point to the backend
- **Backend can't connect to database**: Verify database connection string and ensure the database service is running
- **Database not seeding**: Check logs with `docker-compose logs backend` to see if there are any errors during seeding
- **Container won't start**: Check logs with `docker-compose logs`
