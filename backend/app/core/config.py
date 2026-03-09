from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AI Job Copilot"
    version: str = "0.1.0"
    environment: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
