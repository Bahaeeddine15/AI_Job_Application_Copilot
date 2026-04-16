from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AI Job Copilot"
    version: str = "0.1.0"
    environment: str = "development"
    GEMINI_API_KEY: str
     # JWT settings
    JWT_SECRET_KEY: str ="cac59cb3a72a467b5a91b632596a64108018d20b2da9c63045b032a9cb4607f3" # set in .env
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
