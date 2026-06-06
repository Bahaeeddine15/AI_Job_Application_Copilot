from pathlib import Path

from pydantic import Field, SecretStr, ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict

#this is the settings file where we will store all the configuration for the application. 
# We will use pydantic to validate the settings and load them from a .env file. 
# We will also use SecretStr to store sensitive information like API keys and JWT secret key.
class Settings(BaseSettings):
    app_name: str = "AI Job Copilot"
    version: str = "0.1.0"
    environment: str = "development"
    
    #GEMINI_API_KEY: SecretStr = Field(validation_alias="GEMINI_API_KEY")
    GROQ_API_KEY:SecretStr = Field(validation_alias="GROQ_API_KEY")
    GROQ_MODEL:str=Field(default="llama-3.3-70b-versatile", validation_alias="GROQ_MODEL")
    # JWT settings
    JWT_SECRET_KEY: SecretStr = Field(validation_alias="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60 * 24,
        validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES",
    )

    model_config = SettingsConfigDict(
        
        env_file=str(Path(__file__).resolve().parents[2] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )
    


settings = Settings()

