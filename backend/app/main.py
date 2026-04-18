from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import system, analysis, application, resume, auth
from app.database.connection import init_db

app = FastAPI(title="AI Job Copilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    """Initialize database tables on app startup."""
    init_db()

app.include_router(system.router)
app.include_router(analysis.router)
app.include_router(application.router)
app.include_router(resume.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    """Root endpoint for a quick sanity check."""
    return {
        "message": "Welcome to the AI Job Copilot API",
        "docs": "/docs"
    }