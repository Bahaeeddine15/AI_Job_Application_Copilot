from fastapi import FastAPI
from app.routers import system, analysis, application, resume
from app.database.connection import init_db  # <-- Add this import

app = FastAPI(title="AI Job Copilot API")

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    """Initialize database tables on app startup."""
    init_db()

app.include_router(system.router)
app.include_router(analysis.router)
app.include_router(application.router)
app.include_router(resume.router)

@app.get("/")
async def root():
    """Root endpoint for a quick sanity check."""
    return {
        "message": "Welcome to the AI Job Copilot API",
        "docs": "/docs"
    }