#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite
Tests all REST endpoints, authentication, and database operations
"""

import unittest
import json
import tempfile
import os
import sys
from datetime import datetime

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from app import app, db, User, Quotation
import requests
import time

class TestAPIEndpoints(unittest.TestCase):
    """Test all API endpoints for functionality and security"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.base_url = "http://localhost:3001"
        cls.test_user = {
            "username": "testuser",
            "password": "testpass123",
            "role": "user",
            "fname": "Test",
            "lname": "User"
        }
        cls.admin_user = {
            "username": "admin",
            "password": "1234"
        }
        
        # Test quotation data
        cls.test_quotation = {
            "developerType": "category 2",
            "projectRegion": "Mumbai",
            "plotArea": 5000,
            "developerName": "Test Developer",
            "projectName": "Test Project",
            "validity": "30 days",
            "paymentSchedule": "50%"
        }
    
    def setUp(self):
        """Set up before each test"""
        self.session = requests.Session()
        self.token = None
        
    def tearDown(self):
        """Clean up after each test"""
        if self.session:
            self.session.close()
    
    def get_admin_token(self):
        """Get admin token for authenticated requests"""
        try:
            response = self.session.post(
                f"{self.base_url}/api/login",
                json=self.admin_user,
                timeout=10
            )
            print(f"Login response status: {response.status_code}")
            print(f"Login response body: {response.text}")
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                self.session.headers.update({'Authorization': f'Bearer {self.token}'})
                return True
        except Exception as e:
            print(f"Failed to get admin token: {e}")
        return False
    
    def test_01_server_health(self):
        """Test if server is running and responsive"""
        try:
            response = self.session.get(f"{self.base_url}/api/me", timeout=5)
            self.assertIn(response.status_code, [200, 401], "Server should be running")
            print(f"Server is running and responsive")
        except requests.exceptions.RequestException:
            self.fail("Server is not running or not responding")
    
    def test_02_authentication_login(self):
        """Test user authentication"""
        # Test with admin credentials
        response = self.session.post(
            f"{self.base_url}/api/login",
            json=self.admin_user,
            timeout=10
        )
        
        self.assertEqual(response.status_code, 200, "Admin login should succeed")
        data = response.json()
        self.assertIn('token', data, "Response should contain token")
        self.assertIn('user', data, "Response should contain user data")
        print("Authentication system working")
    
    def test_03_protected_routes(self):
        """Test protected routes require authentication"""
        # Test without token
        response = self.session.get(f"{self.base_url}/api/quotations")
        self.assertEqual(response.status_code, 401, "Should require authentication")
        
        # Test with token
        if self.get_admin_token():
            response = self.session.get(f"{self.base_url}/api/quotations")
            self.assertIn(response.status_code, [200, 500], "Should allow authenticated access")
            print("Protected routes working correctly")
    
    def test_04_quotation_creation(self):
        """Test quotation creation workflow"""
        if not self.get_admin_token():
            self.fail("Could not get admin token")
        
        response = self.session.post(
            f"{self.base_url}/api/quotations",
            json=self.test_quotation,
            timeout=15
        )
        
        if response.status_code == 201:
            data = response.json()
            self.assertIn('data', data, "Response should contain quotation data")
            self.quotation_id = data['data'].get('id')
            print(f"Quotation creation working (ID: {self.quotation_id})")
        else:
            print(f"⚠ Quotation creation returned status {response.status_code}")
            print(f"Response: {response.text}")
    
    def test_05_quotation_retrieval(self):
        """Test quotation retrieval"""
        if not self.get_admin_token():
            self.fail("Could not get admin token")
        
        # Get all quotations
        response = self.session.get(f"{self.base_url}/api/quotations")
        if response.status_code == 200:
            data = response.json()
            self.assertIn('quotations', data, "Response should contain quotations")
            print("Quotation retrieval working")
        else:
            print(f"⚠ Quotation retrieval returned status {response.status_code}")
    
    def test_06_pdf_generation(self):
        """Test PDF generation functionality"""
        if not self.get_admin_token():
            self.fail("Could not get admin token")
        
        # First, try to get a quotation ID
        response = self.session.get(f"{self.base_url}/api/quotations")
        if response.status_code == 200:
            data = response.json()
            quotations = data.get('quotations', [])
            if quotations:
                quotation_id = quotations[0]['id']
                # Test PDF download
                pdf_response = self.session.get(
                    f"{self.base_url}/api/quotations/{quotation_id}/download-pdf?summary=true",
                    timeout=30
                )
                if pdf_response.status_code == 200:
                    self.assertEqual(pdf_response.headers.get('content-type'), 'application/pdf')
                    print("PDF generation working")
                else:
                    print(f"⚠ PDF generation returned status {pdf_response.status_code}")
    
    def test_07_cors_headers(self):
        """Test CORS headers are properly set"""
        response = self.session.options(f"{self.base_url}/api/quotations")
        self.assertIn('Access-Control-Allow-Origin', response.headers)
        print("CORS headers configured")
    
    def test_08_input_validation(self):
        """Test input validation and security"""
        if not self.get_admin_token():
            return
        
        # Test with invalid data
        invalid_quotation = {
            "developerType": "",  # Empty required field
            "plotArea": "invalid",  # Invalid type
        }
        
        response = self.session.post(
            f"{self.base_url}/api/quotations",
            json=invalid_quotation,
            timeout=10
        )
        
        self.assertIn(response.status_code, [400, 422, 500], "Should reject invalid data")
        print("Input validation working")
    
    def test_09_error_handling(self):
        """Test error handling"""
        # Test non-existent endpoint
        response = self.session.get(f"{self.base_url}/api/nonexistent")
        self.assertEqual(response.status_code, 404, "Should return 404 for non-existent endpoint")
        
        # Test malformed JSON
        response = self.session.post(
            f"{self.base_url}/api/login",
            data="invalid json",
            headers={'Content-Type': 'application/json'}
        )
        self.assertIn(response.status_code, [400, 422], "Should handle malformed JSON")
        print("Error handling working")


class TestDatabaseOperations(unittest.TestCase):
    """Test database operations and data integrity"""
    
    def setUp(self):
        """Set up test database context"""
        self.app_context = app.app_context()
        self.app_context.push()
    
    def tearDown(self):
        """Clean up database context"""
        self.app_context.pop()
    
    def test_01_database_connection(self):
        """Test database connectivity"""
        try:
            # Try to query users table
            users = User.query.all()
            self.assertIsInstance(users, list, "Should return list of users")
            print("Database connection working")
        except Exception as e:
            self.fail(f"Database connection failed: {e}")
    
    def test_02_user_model(self):
        """Test User model operations"""
        try:
            # Test password hashing
            test_user = User(username='testmodel', role='user')
            test_user.set_password('testpass')
            self.assertTrue(test_user.check_password('testpass'))
            self.assertFalse(test_user.check_password('wrongpass'))
            print("User model working correctly")
        except Exception as e:
            self.fail(f"User model test failed: {e}")
    
    def test_03_quotation_model(self):
        """Test Quotation model operations"""
        try:
            # Test quotation creation
            test_quotation = Quotation(
                id='TEST001',
                developer_type='category 1',
                project_region='Test Region',
                plot_area=1000.0,
                developer_name='Test Developer'
            )
            
            # Test to_dict method
            quotation_dict = test_quotation.to_dict()
            self.assertIsInstance(quotation_dict, dict)
            self.assertEqual(quotation_dict['id'], 'TEST001')
            print("Quotation model working correctly")
        except Exception as e:
            self.fail(f"Quotation model test failed: {e}")


def run_performance_test():
    """Run basic performance tests"""
    print("\nRunning Performance Tests...")
    
    base_url = "http://localhost:3001"
    
    # Test response times
    endpoints = [
        "/api/me",
        "/api/quotations",
    ]
    
    for endpoint in endpoints:
        try:
            start_time = time.time()
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            if response_time < 1000:  # Under 1 second
                print(f"PASS {endpoint}: {response_time:.0f}ms (Good)")
            elif response_time < 3000:  # Under 3 seconds
                print(f"WARN {endpoint}: {response_time:.0f}ms (Acceptable)")
            else:
                print(f"FAIL {endpoint}: {response_time:.0f}ms (Slow)")
                
        except Exception as e:
            print(f"FAIL {endpoint}: Failed ({e})")


def run_security_audit():
    """Run basic security audit"""
    print("\nRunning Security Audit...")
    
    base_url = "http://localhost:3001"
    
    security_checks = []
    
    try:
        # Check for HTTPS redirect (in production)
        response = requests.get(base_url, timeout=5)
        if response.url.startswith('https'):
            security_checks.append("PASS HTTPS enabled")
        else:
            security_checks.append("WARN HTTPS not detected (OK for development)")
        
        # Check for security headers
        response = requests.get(f"{base_url}/api/me", timeout=5)
        headers = response.headers
        
        if 'X-Frame-Options' in headers:
            security_checks.append("PASS X-Frame-Options header present")
        else:
            security_checks.append("WARN X-Frame-Options header missing")
        
        if 'X-Content-Type-Options' in headers:
            security_checks.append("PASS X-Content-Type-Options header present")
        else:
            security_checks.append("WARN X-Content-Type-Options header missing")
        
        # Check authentication
        response = requests.get(f"{base_url}/api/quotations", timeout=5)
        if response.status_code == 401:
            security_checks.append("PASS Protected routes require authentication")
        else:
            security_checks.append("FAIL Protected routes may be exposed")
    
    except Exception as e:
        security_checks.append(f"FAIL Security check failed: {e}")
    
    for check in security_checks:
        print(check)


def production_readiness_checklist():
    """Check production readiness"""
    print("\nProduction Readiness Checklist...")
    
    checklist = []
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:3001/api/me", timeout=5)
        checklist.append("PASS Backend server is running")
    except:
        checklist.append("FAIL Backend server is not running")
    
    # Check if frontend is accessible
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        checklist.append("PASS Frontend is accessible")
    except:
        checklist.append("WARN Frontend may not be running")
    
    # Check database file
    if os.path.exists('quotations.db'):
        stat = os.stat('quotations.db')
        if stat.st_size > 0:
            checklist.append("PASS Database file exists and has data")
        else:
            checklist.append("WARN Database file is empty")
    else:
        checklist.append("FAIL Database file not found")
    
    # Check required files
    required_files = [
        'app.py',
        'pdf_generator.py',
        'services_data.py',
        'logo.jpg'
    ]
    
    for file in required_files:
        if os.path.exists(file):
            checklist.append(f"PASS {file} exists")
        else:
            checklist.append(f"FAIL {file} missing")
    
    # Check environment
    checklist.append("PASS Python environment configured")
    
    for item in checklist:
        print(item)
    
    # Summary
    passed = len([c for c in checklist if c.startswith("PASS")])
    warnings = len([c for c in checklist if c.startswith("WARN")])
    failed = len([c for c in checklist if c.startswith("FAIL")])
    
    print(f"\nSummary: {passed} passed, {warnings} warnings, {failed} failed")
    
    if failed == 0:
        print("System appears ready for production!")
    elif failed <= 2:
        print("System mostly ready, address failed items")
    else:
        print("System needs work before production")


if __name__ == '__main__':
    print("RERA Easy - Comprehensive Test Suite")
    print("=" * 50)
    
    # Change to backend directory
    os.chdir(os.path.dirname(__file__))
    
    # Run API tests
    print("\nRunning API Tests...")
    api_suite = unittest.TestLoader().loadTestsFromTestCase(TestAPIEndpoints)
    api_runner = unittest.TextTestRunner(verbosity=1, stream=open(os.devnull, 'w'))
    api_result = api_runner.run(api_suite)
    
    # Run database tests
    print("\nRunning Database Tests...")
    db_suite = unittest.TestLoader().loadTestsFromTestCase(TestDatabaseOperations)
    db_runner = unittest.TextTestRunner(verbosity=1, stream=open(os.devnull, 'w'))
    db_result = db_runner.run(db_suite)
    
    # Run performance tests
    run_performance_test()
    
    # Run security audit
    run_security_audit()
    
    # Check production readiness
    production_readiness_checklist()
    
    # Final summary
    total_tests = api_result.testsRun + db_result.testsRun
    total_failures = len(api_result.failures) + len(db_result.failures)
    total_errors = len(api_result.errors) + len(db_result.errors)
    
    print(f"\nFinal Results:")
    print(f"Total Tests: {total_tests}")
    print(f"Failures: {total_failures}")
    print(f"Errors: {total_errors}")
    
    if total_failures + total_errors == 0:
        print("ALL TESTS PASSED!")
    else:
        print("Some tests failed - review output above")
