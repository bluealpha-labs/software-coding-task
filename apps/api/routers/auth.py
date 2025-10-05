from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from slowapi import Limiter
from slowapi.util import get_remote_address
from api.models.user import User, UserCreate, UserLogin, Token, TokenData
from api.services.auth_service import (
    authenticate_user, create_user, create_access_token, 
    get_user, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
)
from api.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])

# Initialize rate limiter for auth endpoints
limiter = Limiter(key_func=get_remote_address)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return User(**{k: v for k, v in user.dict().items() if k != "hashed_password"})

@router.post("/register", response_model=User, summary="Register a new user", description="Create a new user account with email and password")
@limiter.limit("5/minute")
async def register(request: Request, user: UserCreate):
    try:
        logger.info(f"User registration attempt for email: {user.email}")
        result = create_user(user)
        logger.info(f"User registered successfully: {user.email}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/token", response_model=Token, summary="Login user", description="Authenticate user and return access token")
@limiter.limit("10/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        logger.info(f"Login attempt for email: {form_data.username}")
        user = authenticate_user(form_data.username, form_data.password)
        if not user:
            logger.warning(f"Failed login attempt for email: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        logger.info(f"Successful login for email: {form_data.username}")
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/users/me", response_model=User, summary="Get current user", description="Get information about the currently authenticated user")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
