from pydantic_settings import BaseSettings
from pydantic import Field, validator
import os


class Settings(BaseSettings):
    """Settings for the platform API."""

    # Database
    POSTGRES_USER: str = Field(..., description="PostgreSQL username")
    POSTGRES_PASSWORD: str = Field(..., description="PostgreSQL password")
    POSTGRES_HOST: str = Field(default="localhost", description="PostgreSQL host")
    POSTGRES_PORT: str = Field(default="5432", description="PostgreSQL port")
    POSTGRES_DB: str = Field(..., description="PostgreSQL database name")
    
    # Application
    DEBUG: bool = Field(default=False, description="Debug mode")
    SECRET_KEY: str = Field(..., min_length=32, description="JWT secret key")
    
    # Redis
    REDIS_HOST: str = Field(default="localhost", description="Redis host")
    REDIS_PORT: int = Field(default=6379, description="Redis port")
    REDIS_DB: int = Field(default=0, description="Redis database number")
    
    @validator('SECRET_KEY')
    def validate_secret_key(cls, v):
        if v == "your-secret-key-here":
            raise ValueError("SECRET_KEY must be set to a secure value in production")
        return v
    
    @validator('POSTGRES_PORT')
    def validate_postgres_port(cls, v):
        try:
            port = int(v)
            if not (1 <= port <= 65535):
                raise ValueError("Port must be between 1 and 65535")
            return v
        except ValueError:
            raise ValueError("POSTGRES_PORT must be a valid integer")
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = {
        "env_file": "../../.env.local",
        "extra": "ignore"
    }


# @lru_cache
def get_settings() -> Settings:
    """Get the settings."""
    return Settings() #pyrefly:ignore
