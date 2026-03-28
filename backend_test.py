#!/usr/bin/env python3

import requests
import json
import sys
import random
from datetime import datetime
import uuid

class InstaRoadTaxAPITester:
    def __init__(self, base_url="https://instant-roadtax.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{self.base_url}/api"
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.inquiry_id = None
        
        print(f"🚀 Starting InstaRoadTax API Testing")
        print(f"🌐 Backend URL: {self.base_url}")
        print("=" * 60)

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    headers.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"   ✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"   ❌ FAILED - Exception: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root Check",
            "GET", 
            "",
            200
        )
        return success and response.get('message')

    def test_create_inquiry(self, insurance_type="car"):
        """Test creating a new insurance inquiry"""
        inquiry_data = {
            "insurance_type": insurance_type,
            "vehicle_info": {
                "vehicle_number": f"WXY{random.randint(1000,9999)}",
                "ownership_type": "personal",
                "postcode": "50000"
            },
            "customer_info": {
                "nric_number": "901234-01-1234",
                "phone": "012-3456789",
                "email": f"test{random.randint(100,999)}@example.com"
            },
            "uploaded_documents": [],
            "notes": "Test inquiry for API testing"
        }
        
        success, response = self.run_test(
            f"Create {insurance_type.title()} Insurance Inquiry",
            "POST",
            "inquiries/create",
            200,
            inquiry_data
        )
        
        if success and response.get('inquiry_id'):
            self.inquiry_id = response['inquiry_id']
            print(f"   📋 Created inquiry ID: {self.inquiry_id[:8]}")
            return True
        return False

    def test_get_inquiries(self):
        """Test getting all inquiries (admin)"""
        success, response = self.run_test(
            "Get All Inquiries",
            "GET",
            "inquiries",
            200
        )
        return success and isinstance(response, list)

    def test_get_inquiry_by_id(self):
        """Test getting inquiry by ID"""
        if not self.inquiry_id:
            print("   ⚠️  Skipping - No inquiry ID available")
            return False
            
        success, response = self.run_test(
            "Get Inquiry by ID",
            "GET",
            f"inquiries/{self.inquiry_id}",
            200
        )
        return success and response.get('id') == self.inquiry_id

    def test_check_inquiry_status(self):
        """Test checking inquiry status (customer)"""
        if not self.inquiry_id:
            print("   ⚠️  Skipping - No inquiry ID available")
            return False
            
        success, response = self.run_test(
            "Check Inquiry Status (Customer)",
            "GET",
            f"inquiries/check/{self.inquiry_id}",
            200
        )
        return success and response.get('inquiry_id') == self.inquiry_id

    def test_update_inquiry_status(self):
        """Test updating inquiry status"""
        if not self.inquiry_id:
            print("   ⚠️  Skipping - No inquiry ID available")
            return False
            
        update_data = {
            "status": "processing",
            "admin_notes": "API test - processing inquiry"
        }
        
        success, response = self.run_test(
            "Update Inquiry Status",
            "PUT",
            f"inquiries/{self.inquiry_id}/status",
            200,
            update_data
        )
        return success

    def test_send_quotation(self):
        """Test sending quotation to customer"""
        if not self.inquiry_id:
            print("   ⚠️  Skipping - No inquiry ID available")
            return False
            
        quotation_data = {
            "inquiry_id": self.inquiry_id,
            "insurance_provider": "Etiqa Takaful",
            "coverage_type": "comprehensive", 
            "sum_insured": 50000.0,
            "premium_amount": 850.50,
            "road_tax_amount": 150.00,
            "total_amount": 1000.50,
            "valid_until": "2025-12-31",
            "remarks": "Test quotation via API"
        }
        
        success, response = self.run_test(
            "Send Quotation to Customer",
            "POST",
            f"inquiries/{self.inquiry_id}/quotation",
            200,
            quotation_data
        )
        return success and response.get('quotation')

    def test_file_upload(self):
        """Test file upload functionality"""
        try:
            # Create a test PDF file (allowed format)
            test_content = b"%PDF-1.4\nTest document content for API testing"
            files = {'file': ('test_document.pdf', test_content, 'application/pdf')}
            
            success, response = self.run_test(
                "Upload Test Document",
                "POST",
                "upload",
                200,
                data={},
                files=files
            )
            return success and response.get('file_id')
        except Exception as e:
            print(f"   ❌ File upload test failed: {e}")
            return False

    def test_admin_login(self):
        """Test admin login"""
        login_data = {"password": "admin123"}
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            login_data
        )
        return success and response.get('success')

    def test_admin_stats(self):
        """Test admin dashboard stats"""
        success, response = self.run_test(
            "Get Admin Dashboard Stats",
            "GET",
            "admin/stats",
            200
        )
        expected_fields = ['total_inquiries', 'new_inquiries', 'quoted_inquiries', 'total_revenue']
        return success and all(field in response for field in expected_fields)

    def test_create_payment(self):
        """Test creating payment"""
        if not self.inquiry_id:
            print("   ⚠️  Skipping - No inquiry ID available")
            return False
            
        payment_data = {
            "inquiry_id": self.inquiry_id,
            "amount": 1000.50,
            "currency": "MYR",
            "return_url": f"{self.base_url}/payment-result"
        }
        
        success, response = self.run_test(
            "Create Payment",
            "POST",
            "payments/create",
            200,
            payment_data
        )
        
        if success and response.get('payment_id'):
            self.payment_id = response['payment_id']
            print(f"   💳 Created payment ID: {self.payment_id[:8]}")
            return True
        return False

    def test_simulate_payment(self):
        """Test payment simulation (mocked gateway)"""
        if not hasattr(self, 'payment_id'):
            print("   ⚠️  Skipping - No payment ID available")
            return False
            
        success, response = self.run_test(
            "Simulate Payment Success",
            "POST",
            f"payments/{self.payment_id}/simulate?status=paid",
            200
        )
        return success

    def test_verify_payment(self):
        """Test payment verification"""
        if not hasattr(self, 'payment_id'):
            print("   ⚠️  Skipping - No payment ID available")
            return False
            
        success, response = self.run_test(
            "Verify Payment",
            "POST",
            f"payments/{self.payment_id}/verify",
            200
        )
        return success and response.get('status') == 'paid'

    def test_get_payments(self):
        """Test getting all payments (admin)"""
        success, response = self.run_test(
            "Get All Payments",
            "GET",
            "payments",
            200
        )
        return success and isinstance(response, list)

    def test_payment_refund(self):
        """Test payment refund"""
        if not hasattr(self, 'payment_id'):
            print("   ⚠️  Skipping - No payment ID available")
            return False
            
        success, response = self.run_test(
            "Refund Payment",
            "POST",
            f"payments/{self.payment_id}/refund",
            200
        )
        return success

    def run_full_test_suite(self):
        """Run comprehensive test suite"""
        print("🧪 Running InstaRoadTax API Test Suite")
        print("=" * 60)
        
        tests = [
            ("API Root", self.test_api_root),
            ("Admin Login", self.test_admin_login), 
            ("Admin Stats", self.test_admin_stats),
            ("Create Car Inquiry", lambda: self.test_create_inquiry("car")),
            ("Create Motorcycle Inquiry", lambda: self.test_create_inquiry("motorcycle")),
            ("Get All Inquiries", self.test_get_inquiries),
            ("Get Inquiry by ID", self.test_get_inquiry_by_id),
            ("Check Inquiry Status", self.test_check_inquiry_status),
            ("Update Inquiry Status", self.test_update_inquiry_status),
            ("Send Quotation", self.test_send_quotation),
            ("File Upload", self.test_file_upload),
            ("Create Payment", self.test_create_payment),
            ("Simulate Payment", self.test_simulate_payment),
            ("Verify Payment", self.test_verify_payment),
            ("Get All Payments", self.test_get_payments),
            ("Payment Refund", self.test_payment_refund),
        ]
        
        for test_name, test_func in tests:
            try:
                result = test_func()
                if not result:
                    print(f"   ⚠️  {test_name} had issues")
            except Exception as e:
                print(f"   💥 {test_name} threw exception: {e}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = InstaRoadTaxAPITester()
    return tester.run_full_test_suite()

if __name__ == "__main__":
    sys.exit(main())