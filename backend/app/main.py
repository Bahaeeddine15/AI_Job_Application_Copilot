from fastapi import FastAPI
from app.routers import system

app = FastAPI(title="AI Job Copilot API")

app.include_router(system.router)
