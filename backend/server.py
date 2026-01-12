from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 1440))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI(title="Muqaddas Network API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    role: str = "user"
    is_vip: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: str
    is_vip: bool
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class DonationCreate(BaseModel):
    amount: float
    donor_name: str
    donor_phone: Optional[str] = None
    message: Optional[str] = None

class Donation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    amount: float
    donor_name: str
    donor_phone: Optional[str] = None
    message: Optional[str] = None
    charity_contribution: float = 5.0  # ₹5 per donation
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"  # pending, confirmed

class FundStats(BaseModel):
    total_donations: float
    charity_fund: float
    vip_income: float  # 2% of total
    family_equity: float  # 60% locked
    total_donors: int
    total_transactions: int

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone
    )
    
    user_dict = user.model_dump()
    user_dict['password_hash'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create token
    access_token = create_access_token({"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            role=user.role,
            is_vip=user.is_vip,
            created_at=user_dict['created_at']
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(login_data.password, user.get('password_hash', '')):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token({"sub": user['id']})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user['id'],
            name=user['name'],
            email=user['email'],
            phone=user['phone'],
            role=user.get('role', 'user'),
            is_vip=user.get('is_vip', False),
            created_at=user.get('created_at', '')
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user['id'],
        name=current_user['name'],
        email=current_user['email'],
        phone=current_user['phone'],
        role=current_user.get('role', 'user'),
        is_vip=current_user.get('is_vip', False),
        created_at=current_user.get('created_at', '')
    )

# ==================== DONATION ROUTES ====================

@api_router.post("/donations", response_model=Donation)
async def create_donation(donation_data: DonationCreate, current_user: dict = Depends(get_current_user)):
    donation = Donation(
        amount=donation_data.amount,
        donor_name=donation_data.donor_name,
        donor_phone=donation_data.donor_phone,
        message=donation_data.message,
        user_id=current_user['id'],
        charity_contribution=5.0  # ₹5 per donation goes to charity
    )
    
    donation_dict = donation.model_dump()
    donation_dict['created_at'] = donation_dict['created_at'].isoformat()
    
    await db.donations.insert_one(donation_dict)
    return donation

@api_router.get("/donations", response_model=List[Donation])
async def get_donations(current_user: dict = Depends(get_current_user)):
    # Optimized: limit to 50 recent donations with sorting
    donations = await db.donations.find(
        {"user_id": current_user['id']}, 
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    return donations

@api_router.get("/donations/all", response_model=List[Donation])
async def get_all_donations():
    donations = await db.donations.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return donations

@api_router.put("/donations/{donation_id}/confirm")
async def confirm_donation(donation_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.donations.update_one(
        {"id": donation_id},
        {"$set": {"status": "confirmed"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Donation not found")
    return {"message": "Donation confirmed"}

# ==================== FUND STATS ROUTES ====================

@api_router.get("/stats", response_model=FundStats)
async def get_fund_stats():
    # Get all confirmed donations
    donations = await db.donations.find({"status": "confirmed"}, {"_id": 0}).to_list(10000)
    
    total_donations = sum(d.get('amount', 0) for d in donations)
    charity_fund = len(donations) * 5.0  # ₹5 per donation
    vip_income = total_donations * 0.02  # 2% VIP gift income
    family_equity = total_donations * 0.60  # 60% family lock
    
    total_donors = len(set(d.get('donor_name', '') for d in donations))
    
    return FundStats(
        total_donations=total_donations,
        charity_fund=charity_fund,
        vip_income=vip_income,
        family_equity=family_equity,
        total_donors=total_donors,
        total_transactions=len(donations)
    )

@api_router.get("/stats/public")
async def get_public_stats():
    donations = await db.donations.find({"status": "confirmed"}, {"_id": 0}).to_list(10000)
    
    total_donations = sum(d.get('amount', 0) for d in donations)
    charity_fund = len(donations) * 5.0
    
    return {
        "total_donations": total_donations,
        "charity_fund": charity_fund,
        "total_donors": len(set(d.get('donor_name', '') for d in donations)),
        "total_transactions": len(donations),
        "family_equity_percent": 60,
        "vip_income_percent": 2
    }

# ==================== FAMILY EQUITY INFO ====================

@api_router.get("/family-equity")
async def get_family_equity_info():
    return {
        "equity_percent": 60,
        "status": "PERMANENTLY LOCKED",
        "beneficiaries": [
            {"name": "AP Aliza Khatun", "relation": "Family Head"},
            {"name": "Daughters", "relation": "Children"}
        ],
        "description": "60% equity is permanently locked for the family. This cannot be changed or transferred.",
        "lock_type": "PERMANENT"
    }

# ==================== ROOT ROUTE ====================

@api_router.get("/")
async def root():
    return {
        "message": "Welcome to Muqaddas Network API",
        "version": "1.0.0",
        "description": "High-tech platform for helping cancer patients and poor people",
        "features": [
            "60% Family Equity Lock",
            "₹5 Charity per Donation",
            "2% VIP Gift Income",
            "Zero-Tax Sovereign Shield"
        ]
    }

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Muqaddas Network"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
