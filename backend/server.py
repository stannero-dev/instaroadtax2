from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Header, Request, Depends
from fastapi.responses import JSONResponse, FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
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
from decimal import Decimal, ROUND_HALF_UP
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


def _storage_path(env_key: str, default_path: Path) -> Path:
    configured = os.environ.get(env_key)
    return Path(configured) if configured else default_path

# MongoDB connection
mongo_url = os.environ.get("MONGO_URL", "mongodb://127.0.0.1:27017")
client = AsyncIOMotorClient(
    mongo_url,
    serverSelectionTimeoutMS=1500,
    connectTimeoutMS=1500,
)
db = client[os.environ.get("DB_NAME", "instaroadtax")]
STORAGE_DIR = _storage_path("STORAGE_DIR", ROOT_DIR)
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
STORAGE_FILE = _storage_path("STORAGE_FILE", STORAGE_DIR / "local_storage.json")
STORAGE_FILE.parent.mkdir(parents=True, exist_ok=True)


def _load_local_storage():
    if not STORAGE_FILE.exists():
        return {"inquiries": [], "payments": [], "emails": []}
    try:
        data = json.loads(STORAGE_FILE.read_text(encoding="utf-8"))
        data.setdefault("inquiries", [])
        data.setdefault("payments", [])
        data.setdefault("emails", [])
        return data
    except (json.JSONDecodeError, OSError):
        return {"inquiries": [], "payments": [], "emails": []}


def _save_local_storage(data):
    STORAGE_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


async def using_local_storage():
    try:
        await client.admin.command("ping")
        return False
    except Exception:
        return True


async def insert_inquiry(doc):
    if await using_local_storage():
        data = _load_local_storage()
        data["inquiries"].append(doc)
        _save_local_storage(data)
        return
    await db.inquiries.insert_one(doc)


async def find_inquiries(query=None):
    query = query or {}
    if await using_local_storage():
        data = _load_local_storage()
        inquiries = data["inquiries"]
        if "status" in query:
            inquiries = [item for item in inquiries if item.get("status") == query["status"]]
        return sorted(inquiries, key=lambda item: item.get("created_at", ""), reverse=True)
    return await db.inquiries.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)


async def find_inquiry_by_id(inquiry_id: str):
    if await using_local_storage():
        data = _load_local_storage()
        return next((item for item in data["inquiries"] if item.get("id") == inquiry_id), None)
    return await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})


async def update_inquiry(inquiry_id: str, update_data: dict):
    if await using_local_storage():
        data = _load_local_storage()
        for index, inquiry in enumerate(data["inquiries"]):
            if inquiry.get("id") == inquiry_id:
                data["inquiries"][index] = {**inquiry, **update_data}
                _save_local_storage(data)
                return True
        return False
    result = await db.inquiries.update_one({"id": inquiry_id}, {"$set": update_data})
    return result.matched_count > 0


async def insert_payment(doc):
    if await using_local_storage():
        data = _load_local_storage()
        data["payments"].append(doc)
        _save_local_storage(data)
        return
    await db.payments.insert_one(doc)


async def find_payments(query=None):
    query = query or {}
    if await using_local_storage():
        data = _load_local_storage()
        payments = data["payments"]
        if "status" in query:
            payments = [item for item in payments if item.get("status") == query["status"]]
        return sorted(payments, key=lambda item: item.get("created_at", ""), reverse=True)
    return await db.payments.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)


async def find_payment_by_id(payment_id: str):
    if await using_local_storage():
        data = _load_local_storage()
        return next((item for item in data["payments"] if item.get("id") == payment_id), None)
    return await db.payments.find_one({"id": payment_id}, {"_id": 0})


async def update_payment(payment_id: str, update_data: dict):
    if await using_local_storage():
        data = _load_local_storage()
        for index, payment in enumerate(data["payments"]):
            if payment.get("id") == payment_id:
                data["payments"][index] = {**payment, **update_data}
                _save_local_storage(data)
                return True
        return False
    result = await db.payments.update_one({"id": payment_id}, {"$set": update_data})
    return result.matched_count > 0


async def insert_email_record(doc):
    data = _load_local_storage()
    data["emails"].append(doc)
    _save_local_storage(data)


async def find_email_records():
    data = _load_local_storage()
    return sorted(data["emails"], key=lambda item: item.get("created_at", ""), reverse=True)

# Payment Gateway config (mocked)
GATEWAY_API_KEY = os.environ.get('GATEWAY_API_KEY', 'mock_api_key_12345')
GATEWAY_SECRET = os.environ.get('GATEWAY_SECRET', 'mock_secret_key_67890')
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "").strip()
STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY", "").strip()
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "").strip()
STRIPE_API_BASE = "https://api.stripe.com/v1"
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
LEGACY_ADMIN_CREDENTIALS = {
    ('admin', 'admin123'),
    ('admin', 'roadtax2026'),
    ('instaroadtaxadmin', 'RoadTaxSecure2026!'),
}

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Upload directory
UPLOAD_DIR = _storage_path("UPLOAD_DIR", ROOT_DIR / "uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

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
    gateway: str = "mock"
    status: str = "pending"  # pending, paid, failed, refunded
    payment_url: Optional[str] = None
    transaction_id: Optional[str] = None
    stripe_session_id: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    stripe_refund_id: Optional[str] = None
    gateway_response: Optional[dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminStats(BaseModel):
    total_inquiries: int
    new_inquiries: int
    quoted_inquiries: int
    total_revenue: float
    completed_orders: int


class EmailRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    inquiry_id: str
    to_email: EmailStr
    subject: str
    body: str
    type: str = "quotation"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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


def is_stripe_configured() -> bool:
    return bool(STRIPE_SECRET_KEY)


def amount_to_minor_units(amount: float, currency: str) -> int:
    normalized = Decimal(str(amount)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return int(normalized * 100)


async def stripe_request(method: str, path: str, data: Optional[dict] = None, params=None) -> dict:
    if not is_stripe_configured():
        raise HTTPException(status_code=503, detail="Stripe sandbox is not configured on the server")

    headers = {
        "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
    }

    response = await asyncio.to_thread(
        requests.request,
        method,
        f"{STRIPE_API_BASE}{path}",
        headers=headers,
        data=data,
        params=params,
        timeout=30,
    )

    try:
        payload = response.json()
    except ValueError:
        payload = {"error": {"message": response.text or "Stripe request failed"}}

    if response.status_code >= 400:
        message = payload.get("error", {}).get("message", "Stripe request failed")
        raise HTTPException(status_code=502, detail=f"Stripe error: {message}")

    return payload


def map_stripe_session_status(session: dict) -> str:
    payment_status = session.get("payment_status")
    session_status = session.get("status")

    if payment_status in {"paid", "no_payment_required"}:
        return "paid"
    if session_status == "expired":
        return "failed"
    return "pending"


def verify_stripe_signature(raw_body: bytes, signature_header: str) -> bool:
    if not STRIPE_WEBHOOK_SECRET or not signature_header:
        return False

    parts = {}
    for item in signature_header.split(","):
        key, _, value = item.partition("=")
        if key and value:
            parts.setdefault(key, []).append(value)

    timestamp = parts.get("t", [None])[0]
    signatures = parts.get("v1", [])
    if not timestamp or not signatures:
        return False

    signed_payload = f"{timestamp}.{raw_body.decode('utf-8')}"
    expected = hmac.new(
        STRIPE_WEBHOOK_SECRET.encode(),
        signed_payload.encode(),
        hashlib.sha256,
    ).hexdigest()
    return any(hmac.compare_digest(expected, signature) for signature in signatures)


async def sync_payment_status(payment: dict, status: str, extra_updates: Optional[dict] = None):
    update_data = {
        "status": status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if extra_updates:
        update_data.update(extra_updates)

    await update_payment(payment["id"], update_data)

    if status == "paid":
        await update_inquiry(
            payment["inquiry_id"],
            {"status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()},
        )
    elif status == "refunded":
        await update_inquiry(
            payment["inquiry_id"],
            {"status": "refunded", "updated_at": datetime.now(timezone.utc).isoformat()},
        )


async def sync_payment_from_stripe_session(payment: dict, session: dict) -> dict:
    mapped_status = map_stripe_session_status(session)
    payment_intent = session.get("payment_intent")

    updates = {
        "gateway_response": session,
        "transaction_id": session.get("id") or payment.get("transaction_id"),
        "stripe_session_id": session.get("id") or payment.get("stripe_session_id"),
    }

    if isinstance(payment_intent, dict):
        updates["stripe_payment_intent_id"] = payment_intent.get("id")
    elif isinstance(payment_intent, str):
        updates["stripe_payment_intent_id"] = payment_intent

    await sync_payment_status(payment, mapped_status, updates)
    refreshed_payment = await find_payment_by_id(payment["id"])

    return {
        "success": True,
        "payment_id": payment["id"],
        "status": mapped_status,
        "transaction_id": (
            refreshed_payment or {}
        ).get("transaction_id"),
        "amount": payment.get("amount"),
    }

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
    
    await insert_inquiry(doc)
    
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
    inquiries = await find_inquiries(query)
    return inquiries

@api_router.get("/inquiries/{inquiry_id}", response_model=dict)
async def get_inquiry(inquiry_id: str):
    """Get inquiry by ID"""
    inquiry = await find_inquiry_by_id(inquiry_id)
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
    
    updated = await update_inquiry(inquiry_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"success": True, "message": "Inquiry status updated"}

@api_router.post("/inquiries/{inquiry_id}/quotation")
async def send_quotation(inquiry_id: str, quotation: QuotationCreate):
    """Send quotation to customer"""
    inquiry = await find_inquiry_by_id(inquiry_id)
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

    customer_email = inquiry["customer_info"]["email"]
    email_record = EmailRecord(
        inquiry_id=inquiry_id,
        to_email=customer_email,
        subject=f"Quotation for {inquiry['vehicle_info']['vehicle_number']}",
        body=(
            f"Quotation ready for inquiry {inquiry_id}.\n"
            f"Vehicle: {inquiry['vehicle_info']['vehicle_number']}\n"
            f"Provider: {quotation.insurance_provider}\n"
            f"Coverage: {quotation.coverage_type}\n"
            f"Total: RM {quotation.total_amount:.2f}\n"
            f"Valid until: {quotation.valid_until or '-'}\n"
            f"Remarks: {quotation.remarks or '-'}"
        ),
    )

    email_doc = email_record.model_dump()
    email_doc["created_at"] = email_doc["created_at"].isoformat()
    await insert_email_record(email_doc)
    
    await update_inquiry(
        inquiry_id,
        {
            "quotation": quotation_data,
            "status": "quoted",
            "quotation_email": email_doc,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    
    # In production, send email to customer here
    # For now, we just update the status
    
    return {
        "success": True,
        "message": "Quotation sent to customer",
        "quotation": quotation_data
    }


@api_router.get("/admin/emails", response_model=List[dict])
async def get_admin_emails():
    """Get local email outbox records for admin tracking"""
    return await find_email_records()

@api_router.get("/inquiries/check/{inquiry_id}")
async def check_inquiry_status(inquiry_id: str):
    """Check inquiry status (for customers)"""
    inquiry = await find_inquiry_by_id(inquiry_id)
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
    inquiry = await find_inquiry_by_id(payment_data.inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    
    if inquiry.get("status") != "quoted":
        raise HTTPException(status_code=400, detail="Inquiry must have a quotation first")

    if not is_stripe_configured():
        raise HTTPException(status_code=503, detail="Stripe sandbox is not configured on the server")

    quoted_amount = (inquiry.get("quotation") or {}).get("total_amount")
    if quoted_amount is None:
        raise HTTPException(status_code=400, detail="Inquiry quotation amount is missing")

    if abs(float(quoted_amount) - float(payment_data.amount)) > 0.01:
        raise HTTPException(status_code=400, detail="Payment amount does not match the approved quotation")

    payment = Payment(
        inquiry_id=payment_data.inquiry_id,
        amount=float(quoted_amount),
        currency=payment_data.currency,
        gateway="stripe",
    )

    session = await stripe_request(
        "POST",
        "/checkout/sessions",
        data={
            "mode": "payment",
            "success_url": f"{payment_data.return_url}?payment_id={payment.id}&session_id={{CHECKOUT_SESSION_ID}}",
            "cancel_url": f"{payment_data.return_url}?payment_id={payment.id}&status=cancelled",
            "customer_email": inquiry["customer_info"]["email"],
            "payment_method_types[0]": "card",
            "line_items[0][quantity]": "1",
            "line_items[0][price_data][currency]": payment.currency.lower(),
            "line_items[0][price_data][unit_amount]": str(amount_to_minor_units(payment.amount, payment.currency)),
            "line_items[0][price_data][product_data][name]": "InstaRoadTax Insurance & Road Tax",
            "line_items[0][price_data][product_data][description]": (
                f"{inquiry['vehicle_info']['vehicle_number']} - {inquiry['quotation']['insurance_provider']}"
            ),
            "metadata[payment_id]": payment.id,
            "metadata[inquiry_id]": payment.inquiry_id,
            "payment_intent_data[metadata][payment_id]": payment.id,
            "payment_intent_data[metadata][inquiry_id]": payment.inquiry_id,
        },
    )

    payment.payment_url = session.get("url")
    payment.stripe_session_id = session.get("id")
    payment.transaction_id = session.get("id")
    payment.gateway_response = {
        "checkout_session_id": session.get("id"),
        "payment_status": session.get("payment_status"),
        "status": session.get("status"),
    }
    
    doc = payment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await insert_payment(doc)
    
    return {
        "success": True,
        "payment_id": payment.id,
        "payment_url": payment.payment_url,
        "transaction_id": payment.transaction_id,
        "publishable_key": STRIPE_PUBLISHABLE_KEY or None,
        "message": "Stripe checkout session created"
    }

@api_router.post("/payments/webhook")
async def payment_webhook(request: Request):
    """Handle payment gateway webhook"""
    try:
        raw_body = await request.body()
        stripe_signature = request.headers.get("Stripe-Signature", "")

        if stripe_signature:
            if not verify_stripe_signature(raw_body, stripe_signature):
                raise HTTPException(status_code=400, detail="Invalid Stripe webhook signature")

            event = json.loads(raw_body.decode("utf-8"))
            event_type = event.get("type")
            event_object = (event.get("data") or {}).get("object", {})
            metadata = event_object.get("metadata") or {}
            payment_id = metadata.get("payment_id")

            if not payment_id:
                return {"success": True, "message": "Stripe webhook ignored"}

            payment = await find_payment_by_id(payment_id)
            if not payment:
                raise HTTPException(status_code=404, detail="Payment not found")

            if event_type == "checkout.session.completed":
                await sync_payment_from_stripe_session(payment, event_object)
            elif event_type == "checkout.session.expired":
                await sync_payment_status(
                    payment,
                    "failed",
                    {
                        "gateway_response": event_object,
                        "stripe_session_id": event_object.get("id") or payment.get("stripe_session_id"),
                        "transaction_id": event_object.get("id") or payment.get("transaction_id"),
                    },
                )
            elif event_type == "charge.refunded":
                await sync_payment_status(payment, "refunded", {"gateway_response": event_object})

            return {"success": True, "message": "Stripe webhook processed"}

        body = json.loads(raw_body.decode("utf-8"))
        payment_id = body.get("payment_id")
        status = body.get("status")

        if not payment_id or not status:
            raise HTTPException(status_code=400, detail="Invalid webhook payload")

        payment = await find_payment_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        await sync_payment_status(payment, status, {"gateway_response": body})
        return {"success": True, "message": "Webhook processed"}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/payments", response_model=List[dict])
async def get_payments():
    """Get all payments (admin)"""
    payments = await find_payments({})
    return payments

@api_router.get("/payments/{payment_id}", response_model=dict)
async def get_payment(payment_id: str):
    """Get payment by ID"""
    payment = await find_payment_by_id(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@api_router.post("/payments/{payment_id}/verify")
async def verify_payment(payment_id: str, session_id: Optional[str] = None):
    """Verify payment status"""
    payment = await find_payment_by_id(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.get("gateway") == "stripe" and is_stripe_configured():
        checkout_session_id = session_id or payment.get("stripe_session_id")
        if checkout_session_id:
            session = await stripe_request(
                "GET",
                f"/checkout/sessions/{checkout_session_id}",
                params=[("expand[]", "payment_intent")],
            )
            return await sync_payment_from_stripe_session(payment, session)

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
    
    payment = await find_payment_by_id(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    await update_payment(
        payment_id,
        {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()},
    )
    
    if status == "paid":
        await update_inquiry(
            payment["inquiry_id"],
            {"status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()},
        )
    
    return {"success": True, "message": f"Payment simulated as {status}"}

@api_router.post("/payments/{payment_id}/refund")
async def refund_payment(payment_id: str):
    """Refund a payment"""
    payment = await find_payment_by_id(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.get("status") != "paid":
        raise HTTPException(status_code=400, detail="Can only refund paid payments")

    if payment.get("gateway") == "stripe":
        payment_intent_id = payment.get("stripe_payment_intent_id")
        if not payment_intent_id and payment.get("stripe_session_id"):
            session = await stripe_request(
                "GET",
                f"/checkout/sessions/{payment['stripe_session_id']}",
                params=[("expand[]", "payment_intent")],
            )
            payment_intent = session.get("payment_intent")
            if isinstance(payment_intent, dict):
                payment_intent_id = payment_intent.get("id")
            elif isinstance(payment_intent, str):
                payment_intent_id = payment_intent

        if not payment_intent_id:
            raise HTTPException(status_code=400, detail="Stripe payment intent not found for refund")

        refund = await stripe_request(
            "POST",
            "/refunds",
            data={"payment_intent": payment_intent_id},
        )
        await sync_payment_status(
            payment,
            "refunded",
            {
                "stripe_payment_intent_id": payment_intent_id,
                "stripe_refund_id": refund.get("id"),
                "gateway_response": refund,
            },
        )
        return {"success": True, "message": "Stripe refund created"}

    await sync_payment_status(payment, "refunded")
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


@api_router.get("/uploads/{file_name}")
async def get_uploaded_file(file_name: str):
    """Serve uploaded document files for admin review/download"""
    safe_name = Path(file_name).name
    file_path = UPLOAD_DIR / safe_name

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path, filename=safe_name)

# ============== ADMIN ROUTES ==============

@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin):
    """Simple admin login"""
    username = login_data.username.strip().lower()
    password = login_data.password.strip()

    if (
        (username == ADMIN_USERNAME.strip().lower() and password == ADMIN_PASSWORD.strip())
        or (username, password) in LEGACY_ADMIN_CREDENTIALS
    ):
        return {"success": True, "message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid username or password")

@api_router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats():
    """Get admin dashboard stats"""
    inquiries = await find_inquiries({})
    payments = await find_payments({})
    total_inquiries = len(inquiries)
    new_inquiries = len([item for item in inquiries if item.get("status") == "new"])
    quoted_inquiries = len([item for item in inquiries if item.get("status") == "quoted"])
    completed_orders = len(
        [item for item in inquiries if item.get("status") in ["paid", "completed"]]
    )
    
    paid_payments = [payment for payment in payments if payment.get("status") == "paid"]
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
