from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Header, Request, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import hashlib
import hmac
import base64
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Payment Gateway config (mocked)
GATEWAY_API_KEY = os.environ.get('GATEWAY_API_KEY', 'mock_api_key_12345')
GATEWAY_SECRET = os.environ.get('GATEWAY_SECRET', 'mock_secret_key_67890')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Upload directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# ============== MODELS ==============

class VehicleInfo(BaseModel):
    vehicle_number: str
    ownership_type: str  # personal, company
    postcode: str
    state: Optional[str] = None

class CustomerInfo(BaseModel):
    nric_number: str
    full_name: Optional[str] = None
    phone: str
    email: EmailStr

class InquiryCreate(BaseModel):
    insurance_type: str  # car, motorcycle
    vehicle_info: VehicleInfo
    customer_info: CustomerInfo
    uploaded_documents: List[str] = []
    notes: Optional[str] = None

class Inquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    insurance_type: str
    vehicle_info: VehicleInfo
    customer_info: CustomerInfo
    uploaded_documents: List[str] = []
    notes: Optional[str] = None
    status: str = "new"  # new, processing, quoted, paid, completed, cancelled
    quotation: Optional[dict] = None
    admin_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuotationCreate(BaseModel):
    inquiry_id: str
    insurance_provider: str
    coverage_type: str  # comprehensive, third_party_fire_theft, third_party
    sum_insured: float
    premium_amount: float
    road_tax_amount: float
    total_amount: float
    valid_until: str
    remarks: Optional[str] = None

class PaymentCreate(BaseModel):
    inquiry_id: str
    amount: float
    currency: str = "MYR"
    return_url: str

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    inquiry_id: str
    amount: float
    currency: str = "MYR"
    status: str = "pending"  # pending, paid, failed, refunded
    payment_url: Optional[str] = None
    transaction_id: Optional[str] = None
    gateway_response: Optional[dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    password: str

class AdminStats(BaseModel):
    total_inquiries: int
    new_inquiries: int
    quoted_inquiries: int
    total_revenue: float
    completed_orders: int

class UpdateInquiryStatus(BaseModel):
    status: str
    admin_notes: Optional[str] = None

# ============== HELPER FUNCTIONS ==============

def generate_payment_signature(payload: dict) -> str:
    """Generate HMAC signature for payment verification"""
    message = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        GATEWAY_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature

def verify_webhook_signature(payload: dict, signature: str) -> bool:
    """Verify webhook signature"""
    expected_signature = generate_payment_signature(payload)
    return hmac.compare_digest(expected_signature, signature)

# ============== API ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "InstaRoadTax API - Car Insurance & Road Tax Agency Services"}

# ============== INQUIRY ROUTES ==============

@api_router.post("/inquiries/create", response_model=dict)
async def create_inquiry(inquiry_data: InquiryCreate):
    """Create a new insurance inquiry"""
    inquiry = Inquiry(
        insurance_type=inquiry_data.insurance_type,
        vehicle_info=inquiry_data.vehicle_info,
        customer_info=inquiry_data.customer_info,
        uploaded_documents=inquiry_data.uploaded_documents,
        notes=inquiry_data.notes
    )
    
    doc = inquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    doc['vehicle_info'] = inquiry_data.vehicle_info.model_dump()
    doc['customer_info'] = inquiry_data.customer_info.model_dump()
    
    await db.inquiries.insert_one(doc)
    
    return {
        "success": True,
        "inquiry_id": inquiry.id,
        "message": "Inquiry submitted successfully. We will contact you with a quotation soon."
    }

@api_router.get("/inquiries", response_model=List[dict])
async def get_inquiries(status: Optional[str] = None):
    """Get all inquiries (admin)"""
    query = {}
    if status:
        query["status"] = status
    inquiries = await db.inquiries.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return inquiries

@api_router.get("/inquiries/{inquiry_id}", response_model=dict)
async def get_inquiry(inquiry_id: str):
    """Get inquiry by ID"""
    inquiry = await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inquiry

@api_router.put("/inquiries/{inquiry_id}/status")
async def update_inquiry_status(inquiry_id: str, data: UpdateInquiryStatus):
    """Update inquiry status"""
    update_data = {
        "status": data.status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if data.admin_notes:
        update_data["admin_notes"] = data.admin_notes
    
    result = await db.inquiries.update_one(
        {"id": inquiry_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"success": True, "message": "Inquiry status updated"}

@api_router.post("/inquiries/{inquiry_id}/quotation")
async def send_quotation(inquiry_id: str, quotation: QuotationCreate):
    """Send quotation to customer"""
    inquiry = await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    
    quotation_data = {
        "insurance_provider": quotation.insurance_provider,
        "coverage_type": quotation.coverage_type,
        "sum_insured": quotation.sum_insured,
        "premium_amount": quotation.premium_amount,
        "road_tax_amount": quotation.road_tax_amount,
        "total_amount": quotation.total_amount,
        "valid_until": quotation.valid_until,
        "remarks": quotation.remarks,
        "sent_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.inquiries.update_one(
        {"id": inquiry_id},
        {
            "$set": {
                "quotation": quotation_data,
                "status": "quoted",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # In production, send email to customer here
    # For now, we just update the status
    
    return {
        "success": True,
        "message": "Quotation sent to customer",
        "quotation": quotation_data
    }

@api_router.get("/inquiries/check/{inquiry_id}")
async def check_inquiry_status(inquiry_id: str):
    """Check inquiry status (for customers)"""
    inquiry = await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    
    # Return limited info for customer
    return {
        "inquiry_id": inquiry["id"],
        "status": inquiry["status"],
        "vehicle_number": inquiry["vehicle_info"]["vehicle_number"],
        "quotation": inquiry.get("quotation"),
        "created_at": inquiry["created_at"]
    }

# ============== PAYMENT ROUTES ==============

@api_router.post("/payments/create", response_model=dict)
async def create_payment(payment_data: PaymentCreate):
    """Create a payment for approved quotation"""
    inquiry = await db.inquiries.find_one({"id": payment_data.inquiry_id}, {"_id": 0})
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    
    if inquiry.get("status") != "quoted":
        raise HTTPException(status_code=400, detail="Inquiry must have a quotation first")
    
    transaction_id = f"TXN_{uuid.uuid4().hex[:12].upper()}"
    
    payment = Payment(
        inquiry_id=payment_data.inquiry_id,
        amount=payment_data.amount,
        currency=payment_data.currency,
        transaction_id=transaction_id
    )
    
    payment_token = base64.urlsafe_b64encode(
        f"{payment.id}:{transaction_id}".encode()
    ).decode()
    
    payment_url = f"{payment_data.return_url}?payment_id={payment.id}&token={payment_token}&status=pending"
    payment.payment_url = payment_url
    
    doc = payment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.payments.insert_one(doc)
    
    return {
        "success": True,
        "payment_id": payment.id,
        "payment_url": payment_url,
        "transaction_id": transaction_id,
        "message": "Payment created. Redirect user to payment_url"
    }

@api_router.post("/payments/webhook")
async def payment_webhook(request: Request):
    """Handle payment gateway webhook"""
    try:
        body = await request.json()
        signature = request.headers.get("X-Gateway-Signature", "")
        
        payment_id = body.get("payment_id")
        status = body.get("status")
        
        if not payment_id or not status:
            raise HTTPException(status_code=400, detail="Invalid webhook payload")
        
        result = await db.payments.update_one(
            {"id": payment_id},
            {
                "$set": {
                    "status": status,
                    "gateway_response": body,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        if status == "paid":
            payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
            if payment:
                await db.inquiries.update_one(
                    {"id": payment["inquiry_id"]},
                    {"$set": {"status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
        
        return {"success": True, "message": "Webhook processed"}
    
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/payments", response_model=List[dict])
async def get_payments():
    """Get all payments (admin)"""
    payments = await db.payments.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return payments

@api_router.get("/payments/{payment_id}", response_model=dict)
async def get_payment(payment_id: str):
    """Get payment by ID"""
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@api_router.post("/payments/{payment_id}/verify")
async def verify_payment(payment_id: str):
    """Verify payment status"""
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return {
        "success": True,
        "payment_id": payment_id,
        "status": payment.get("status", "pending"),
        "transaction_id": payment.get("transaction_id"),
        "amount": payment.get("amount")
    }

@api_router.post("/payments/{payment_id}/simulate")
async def simulate_payment(payment_id: str, status: str = "paid"):
    """Simulate payment completion (for testing)"""
    if status not in ["paid", "failed", "refunded"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    await db.payments.update_one(
        {"id": payment_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if status == "paid":
        await db.inquiries.update_one(
            {"id": payment["inquiry_id"]},
            {"$set": {"status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {"success": True, "message": f"Payment simulated as {status}"}

@api_router.post("/payments/{payment_id}/refund")
async def refund_payment(payment_id: str):
    """Refund a payment"""
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.get("status") != "paid":
        raise HTTPException(status_code=400, detail="Can only refund paid payments")
    
    await db.payments.update_one(
        {"id": payment_id},
        {"$set": {"status": "refunded", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await db.inquiries.update_one(
        {"id": payment["inquiry_id"]},
        {"$set": {"status": "refunded", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Payment refunded"}

# ============== FILE UPLOAD ==============

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload document file"""
    allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="File type not allowed. Allowed: PDF, JPG, PNG, DOC")
    
    file_id = str(uuid.uuid4())
    file_name = f"{file_id}{file_ext}"
    file_path = UPLOAD_DIR / file_name
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    return {
        "success": True,
        "file_id": file_id,
        "file_name": file_name,
        "original_name": file.filename,
        "message": "File uploaded successfully"
    }

# ============== ADMIN ROUTES ==============

@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin):
    """Simple admin login"""
    if login_data.password == ADMIN_PASSWORD:
        return {"success": True, "message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid password")

@api_router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats():
    """Get admin dashboard stats"""
    total_inquiries = await db.inquiries.count_documents({})
    new_inquiries = await db.inquiries.count_documents({"status": "new"})
    quoted_inquiries = await db.inquiries.count_documents({"status": "quoted"})
    completed_orders = await db.inquiries.count_documents({"status": {"$in": ["paid", "completed"]}})
    
    paid_payments = await db.payments.find({"status": "paid"}, {"_id": 0, "amount": 1}).to_list(1000)
    total_revenue = sum(p.get("amount", 0) for p in paid_payments)
    
    return AdminStats(
        total_inquiries=total_inquiries,
        new_inquiries=new_inquiries,
        quoted_inquiries=quoted_inquiries,
        total_revenue=total_revenue,
        completed_orders=completed_orders
    )

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
