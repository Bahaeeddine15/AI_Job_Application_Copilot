from fastapi import FastAPI
from app.routers import system,analysis,application,resume

app = FastAPI(title="AI Job Copilot API")

app.include_router(system.router)
app.include_router(analysis.router)
app.include_router(application.router)
app.include_router(resume.router)

@app.get("/")
async def root():
    """
    Root endpoint for a quick sanity check.
    """
    return {
        "message": "Welcome to the AI Job Copilot API",
        "docs": "/docs"
    }