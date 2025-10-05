from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from api.constants import PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, EMAIL_MAX_LENGTH, FULL_NAME_MAX_LENGTH

class UserBase(BaseModel):
    email: EmailStr = Field(..., max_length=EMAIL_MAX_LENGTH)
    full_name: Optional[str] = Field(None, max_length=FULL_NAME_MAX_LENGTH)

class UserCreate(UserBase):
    password: str = Field(..., min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH)
    
    @validator('password')
    def validate_password(cls, v):
        if not v:
            raise ValueError('Password cannot be empty')
        if len(v) < PASSWORD_MIN_LENGTH:
            raise ValueError(f'Password must be at least {PASSWORD_MIN_LENGTH} characters long')
        if len(v) > PASSWORD_MAX_LENGTH:
            raise ValueError(f'Password must be no more than {PASSWORD_MAX_LENGTH} characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
