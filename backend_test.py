#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class MuqaddasNetworkAPITester:
    def __init__(self, base_url="https://task-updater-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    self.log_test(name, True)
                    return True, response_data
                except:
                    self.log_test(name, True, "No JSON response")
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f" - {error_data}"
                except:
                    error_msg += f" - {response.text[:100]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            self.log_test(name, False, error_msg)
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        self.run_test("Root API Endpoint", "GET", "", 200)
        
        # Test health endpoint
        self.run_test("Health Check", "GET", "health", 200)

    def test_user_registration(self):
        """Test user registration"""
        print("\n" + "="*50)
        print("TESTING USER REGISTRATION")
        print("="*50)
        
        # Generate unique test user
        timestamp = int(time.time())
        test_user_data = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@muqaddas.com",
            "phone": f"+91987654{timestamp % 10000:04d}",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
            print(f"   User ID: {self.user_id}")
            return True
        
        return False

    def test_user_login(self):
        """Test user login with existing user"""
        print("\n" + "="*50)
        print("TESTING USER LOGIN")
        print("="*50)
        
        # Try to login with the registered user
        if not hasattr(self, 'test_email'):
            # Create a new user for login test
            timestamp = int(time.time()) + 1
            self.test_email = f"login{timestamp}@muqaddas.com"
            self.test_password = "LoginTest123!"
            
            # Register first
            register_data = {
                "name": f"Login Test User {timestamp}",
                "email": self.test_email,
                "phone": f"+91987654{timestamp % 10000:04d}",
                "password": self.test_password
            }
            
            success, _ = self.run_test(
                "Register User for Login Test",
                "POST",
                "auth/register",
                200,
                data=register_data
            )
            
            if not success:
                return False
        
        # Now test login
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            # Update token for subsequent tests
            self.token = response['access_token']
            self.user_id = response['user']['id']
            return True
        
        return False

    def test_auth_me(self):
        """Test getting current user info"""
        print("\n" + "="*50)
        print("TESTING AUTH ME ENDPOINT")
        print("="*50)
        
        if not self.token:
            self.log_test("Auth Me", False, "No token available")
            return False
        
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        return success

    def test_family_equity(self):
        """Test family equity endpoint"""
        print("\n" + "="*50)
        print("TESTING FAMILY EQUITY")
        print("="*50)
        
        success, response = self.run_test(
            "Get Family Equity Info",
            "GET",
            "family-equity",
            200
        )
        
        if success:
            # Verify required fields
            required_fields = ['equity_percent', 'status', 'beneficiaries']
            for field in required_fields:
                if field not in response:
                    self.log_test(f"Family Equity - {field} field", False, f"Missing {field}")
                else:
                    self.log_test(f"Family Equity - {field} field", True)
        
        return success

    def test_public_stats(self):
        """Test public stats endpoint"""
        print("\n" + "="*50)
        print("TESTING PUBLIC STATS")
        print("="*50)
        
        success, response = self.run_test(
            "Get Public Stats",
            "GET",
            "stats/public",
            200
        )
        
        if success:
            # Verify required fields
            required_fields = ['total_donations', 'charity_fund', 'total_donors', 'family_equity_percent']
            for field in required_fields:
                if field not in response:
                    self.log_test(f"Public Stats - {field} field", False, f"Missing {field}")
                else:
                    self.log_test(f"Public Stats - {field} field", True)
        
        return success

    def test_donation_creation(self):
        """Test donation creation"""
        print("\n" + "="*50)
        print("TESTING DONATION CREATION")
        print("="*50)
        
        if not self.token:
            self.log_test("Create Donation", False, "No token available")
            return False
        
        donation_data = {
            "amount": 1000.0,
            "donor_name": "Test Donor",
            "donor_phone": "+91987654321",
            "message": "Test donation for cancer patients"
        }
        
        success, response = self.run_test(
            "Create Donation",
            "POST",
            "donations",
            200,
            data=donation_data
        )
        
        if success and 'id' in response:
            self.donation_id = response['id']
            print(f"   Donation ID: {self.donation_id}")
            
            # Verify charity contribution
            if response.get('charity_contribution') == 5.0:
                self.log_test("Donation - Charity Contribution", True)
            else:
                self.log_test("Donation - Charity Contribution", False, f"Expected 5.0, got {response.get('charity_contribution')}")
        
        return success

    def test_get_donations(self):
        """Test getting user donations"""
        print("\n" + "="*50)
        print("TESTING GET DONATIONS")
        print("="*50)
        
        if not self.token:
            self.log_test("Get Donations", False, "No token available")
            return False
        
        success, response = self.run_test(
            "Get User Donations",
            "GET",
            "donations",
            200
        )
        
        return success

    def test_get_all_donations(self):
        """Test getting all donations (public)"""
        print("\n" + "="*50)
        print("TESTING GET ALL DONATIONS")
        print("="*50)
        
        success, response = self.run_test(
            "Get All Donations",
            "GET",
            "donations/all",
            200
        )
        
        return success

    def test_stats_authenticated(self):
        """Test authenticated stats endpoint"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATED STATS")
        print("="*50)
        
        if not self.token:
            self.log_test("Get Stats", False, "No token available")
            return False
        
        success, response = self.run_test(
            "Get Authenticated Stats",
            "GET",
            "stats",
            200
        )
        
        if success:
            # Verify required fields
            required_fields = ['total_donations', 'charity_fund', 'vip_income', 'family_equity']
            for field in required_fields:
                if field not in response:
                    self.log_test(f"Auth Stats - {field} field", False, f"Missing {field}")
                else:
                    self.log_test(f"Auth Stats - {field} field", True)
        
        return success

    def test_donation_confirmation(self):
        """Test donation confirmation"""
        print("\n" + "="*50)
        print("TESTING DONATION CONFIRMATION")
        print("="*50)
        
        if not self.token or not hasattr(self, 'donation_id'):
            self.log_test("Confirm Donation", False, "No token or donation ID available")
            return False
        
        success, response = self.run_test(
            "Confirm Donation",
            "PUT",
            f"donations/{self.donation_id}/confirm",
            200
        )
        
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Muqaddas Network API Tests")
        print(f"🌐 Base URL: {self.base_url}")
        print(f"🔗 API URL: {self.api_url}")
        
        # Test sequence
        test_methods = [
            self.test_health_check,
            self.test_user_registration,
            self.test_user_login,
            self.test_auth_me,
            self.test_family_equity,
            self.test_public_stats,
            self.test_donation_creation,
            self.test_get_donations,
            self.test_get_all_donations,
            self.test_stats_authenticated,
            self.test_donation_confirmation
        ]
        
        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                print(f"❌ Test {test_method.__name__} crashed: {str(e)}")
                self.log_test(test_method.__name__, False, f"Test crashed: {str(e)}")
        
        # Print final results
        print("\n" + "="*60)
        print("FINAL TEST RESULTS")
        print("="*60)
        print(f"📊 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = MuqaddasNetworkAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Test runner crashed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())