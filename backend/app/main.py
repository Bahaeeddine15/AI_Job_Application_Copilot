from fastapi import FastAPI
from app.routers import system
from app.routers import analysis

app = FastAPI(title="AI Job Copilot API")

app.include_router(system.router)
app.include_router(analysis.router)
