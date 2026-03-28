# InstaRoadTax.my - Product Requirements Document

## Original Problem Statement
Create a roadtax agency landing page for instaroadtax.my similar to azamroadtax.my flow. White and yellow professional theme. Agency flow where:
1. Customer submits inquiry with vehicle details
2. Admin reviews and sends quotation via panel/email
3. Customer checks status and views quotation
4. Customer pays for approved quotation

## User Choices
- White and yellow professional theme (similar to azamroadtax.my)
- Form fields: Insurance type (car/motorcycle), vehicle number, postcode, NRIC, phone, email
- Document upload: flexible (car grant, IC, insurance documents)
- Mock payment gateway integration
- Simple password protection for admin (password: admin123)

## Architecture

### Backend (FastAPI + MongoDB)
- **Inquiries Collection**: Stores customer inquiries with vehicle info, customer info, documents, quotations
- **Payments Collection**: Stores payment transactions with status tracking

### API Endpoints
- POST /api/inquiries/create - Create new inquiry
- GET /api/inquiries - List all inquiries (admin)
- GET /api/inquiries/{id} - Get inquiry by ID
- PUT /api/inquiries/{id}/status - Update inquiry status
- POST /api/inquiries/{id}/quotation - Send quotation to customer
- GET /api/inquiries/check/{id} - Check inquiry status (customer)
- POST /api/payments/create - Create payment for approved quotation
- POST /api/payments/webhook - Handle payment webhook
- POST /api/payments/{id}/verify - Verify payment status
- POST /api/payments/{id}/simulate - Simulate payment (for testing)
- POST /api/payments/{id}/refund - Refund payment
- POST /api/upload - Upload documents
- POST /api/admin/login - Admin authentication
- GET /api/admin/stats - Dashboard statistics

### Frontend (React)
- Landing Page: Hero, How It Works, Services, Testimonials, CTA, Footer
- Inquiry Form: 4-step wizard (Insurance Type → Vehicle Details → Documents → Review)
- Check Status Page: Enter inquiry ID to view status and quotation
- Payment Page: Review quotation and pay
- Admin Login: Simple password authentication
- Admin Dashboard: Stats, Inquiries table with quotation dialog, Payments table

## What's Been Implemented ✅

### Date: March 2, 2026 (Updated)

1. **Landing Page (White/Yellow Theme)**
   - Professional white and amber/yellow color scheme
   - Hero section with car image
   - How It Works section (4 steps)
   - Services section (Car, Motorcycle, Road Tax, Claims)
   - Testimonials section
   - CTA section
   - Responsive footer

2. **Inquiry Form (Agency Flow)**
   - Step 1: Insurance type selection (Car/Motorcycle)
   - Step 2: Vehicle details (plate number, ownership, postcode, NRIC, phone, email)
   - Step 3: Document upload with drag & drop
   - Step 4: Review and submit
   - Success page with inquiry ID

3. **Check Status Page**
   - Enter inquiry ID to check status
   - Displays status, vehicle info, quotation details
   - Proceed to payment button when quoted

4. **Admin Panel**
   - Login with password protection
   - Dashboard with stats (total inquiries, new, quoted, revenue)
   - Inquiries table with status badges
   - **Send Quotation Dialog** - Admin can fill quotation details:
     - Insurance provider
     - Coverage type
     - Sum insured
     - Premium amount
     - Road tax amount
     - Total (auto-calculated)
     - Valid until date
     - Remarks
   - Payments table with refund capability

5. **Payment Flow**
   - Mock payment gateway integration
   - Payment simulation for testing
   - Success/failure result pages

## Test Results: 99% Overall Success
- Backend: 100% (16/16 tests passed)
- Frontend: 98%
- Integration: 100%

## Prioritized Backlog

### P0 (Must Have - Completed)
- ✅ Landing page with white/yellow theme
- ✅ Inquiry form with vehicle details
- ✅ Check status page
- ✅ Admin quotation sending
- ✅ Payment flow

### P1 (Should Have)
- Email notifications when quotation is sent
- WhatsApp notification integration
- Real payment gateway (Billplz, iPay88, FPX)
- PDF quotation generation

### P2 (Nice to Have)
- Multiple language support (BM, Chinese)
- SMS notifications
- Customer account/login
- Inquiry history
- Auto-remind customers about expiring quotations

## Next Tasks
1. Add email notification when admin sends quotation
2. Integrate WhatsApp Business for quotation delivery
3. Implement real payment gateway
4. Add PDF quotation generation
