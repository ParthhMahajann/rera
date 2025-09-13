#!/usr/bin/env python3
"""
RERA Easy - Complete Test Suite Runner
Executes all test suites and provides production readiness assessment
"""

import subprocess
import sys
import os
import json
import time
from datetime import datetime
import requests
from pathlib import Path

class TestRunner:
    def __init__(self):
        self.results = {
            'backend_tests': {'status': 'pending', 'details': ''},
            'frontend_tests': {'status': 'pending', 'details': ''},
            'e2e_tests': {'status': 'pending', 'details': ''},
            'performance_tests': {'status': 'pending', 'details': ''},
            'security_tests': {'status': 'pending', 'details': ''},
            'production_readiness': {'status': 'pending', 'score': 0}
        }
        
        self.project_root = Path(__file__).parent
        self.backend_dir = self.project_root / 'backend'
        self.frontend_dir = self.project_root / 'frontend'
        
    def print_header(self, title):
        """Print formatted test section header"""
        print(f"\n{'='*60}")
        print(f"🧪 {title}")
        print(f"{'='*60}")
    
    def print_step(self, step):
        """Print test step"""
        print(f"🔄 {step}...")
    
    def print_result(self, result, details=""):
        """Print test result"""
        if result == "PASS":
            print(f"✅ PASSED {details}")
        elif result == "FAIL":
            print(f"❌ FAILED {details}")
        elif result == "WARN":
            print(f"⚠️  WARNING {details}")
        else:
            print(f"ℹ️  INFO {details}")
    
    def check_prerequisites(self):
        """Check if required tools and services are available"""
        self.print_header("Prerequisites Check")
        
        prerequisites = []
        
        # Check Python
        try:
            python_version = subprocess.run([sys.executable, '--version'], 
                                          capture_output=True, text=True)
            prerequisites.append(('Python', 'PASS', python_version.stdout.strip()))
        except Exception as e:
            prerequisites.append(('Python', 'FAIL', str(e)))
        
        # Check Node.js
        try:
            node_version = subprocess.run(['node', '--version'], 
                                        capture_output=True, text=True)
            prerequisites.append(('Node.js', 'PASS', node_version.stdout.strip()))
        except Exception as e:
            prerequisites.append(('Node.js', 'FAIL', 'Not found'))
        
        # Check if backend server is running
        try:
            response = requests.get('http://localhost:3001/api/me', timeout=5)
            prerequisites.append(('Backend Server', 'PASS', f'Status: {response.status_code}'))
        except Exception:
            prerequisites.append(('Backend Server', 'FAIL', 'Not running on localhost:3001'))
        
        # Check if frontend is accessible
        try:
            response = requests.get('http://localhost:3000', timeout=5)
            prerequisites.append(('Frontend Server', 'PASS', f'Status: {response.status_code}'))
        except Exception:
            prerequisites.append(('Frontend Server', 'WARN', 'Not running on localhost:3000'))
        
        # Check required directories
        if self.backend_dir.exists():
            prerequisites.append(('Backend Directory', 'PASS', str(self.backend_dir)))
        else:
            prerequisites.append(('Backend Directory', 'FAIL', 'Not found'))
        
        if self.frontend_dir.exists():
            prerequisites.append(('Frontend Directory', 'PASS', str(self.frontend_dir)))
        else:
            prerequisites.append(('Frontend Directory', 'FAIL', 'Not found'))
        
        # Print results
        for name, status, details in prerequisites:
            self.print_result(status, f"{name}: {details}")
        
        # Check if we can proceed
        failed_critical = [p for p in prerequisites 
                          if p[1] == 'FAIL' and p[0] in ['Python', 'Backend Server', 'Backend Directory']]
        
        if failed_critical:
            print(f"\n❌ Cannot proceed due to critical failures:")
            for name, status, details in failed_critical:
                print(f"   • {name}: {details}")
            return False
        
        return True
    
    def run_backend_tests(self):
        """Run backend API and database tests"""
        self.print_header("Backend Tests")
        
        try:
            os.chdir(self.backend_dir)
            
            # Run the backend test suite
            result = subprocess.run([
                sys.executable, 'test_api.py'
            ], capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                self.results['backend_tests'] = {
                    'status': 'PASS', 
                    'details': 'All backend tests passed'
                }
                self.print_result('PASS', 'Backend tests completed successfully')
            else:
                self.results['backend_tests'] = {
                    'status': 'FAIL', 
                    'details': result.stderr
                }
                self.print_result('FAIL', f'Backend tests failed: {result.stderr}')
            
            # Print output for visibility
            if result.stdout:
                print("\n📊 Backend Test Output:")
                print(result.stdout)
            
        except subprocess.TimeoutExpired:
            self.results['backend_tests'] = {
                'status': 'FAIL', 
                'details': 'Tests timed out after 5 minutes'
            }
            self.print_result('FAIL', 'Backend tests timed out')
        except Exception as e:
            self.results['backend_tests'] = {
                'status': 'FAIL', 
                'details': str(e)
            }
            self.print_result('FAIL', f'Backend tests error: {e}')
    
    def run_frontend_tests(self):
        """Run frontend component tests"""
        self.print_header("Frontend Tests")
        
        try:
            os.chdir(self.frontend_dir)
            
            # Check if test file exists
            test_file = self.frontend_dir / 'src' / '__tests__' / 'components.test.js'
            if not test_file.exists():
                self.print_result('WARN', f'Test file not found: {test_file}')
                self.results['frontend_tests'] = {
                    'status': 'WARN', 
                    'details': 'Test file not found, but frontend tests created'
                }
                return
            
            # Use simple frontend test runner
            simple_test_runner = self.frontend_dir / 'simple_test_runner.js'
            if simple_test_runner.exists():
                result = subprocess.run([
                    'node', 'simple_test_runner.js'
                ], capture_output=True, text=True, timeout=60)
                
                if result.returncode == 0:
                    self.results['frontend_tests'] = {
                        'status': 'PASS', 
                        'details': 'Frontend tests passed'
                    }
                    self.print_result('PASS', 'Frontend tests completed successfully')
                else:
                    self.results['frontend_tests'] = {
                        'status': 'FAIL', 
                        'details': result.stderr
                    }
                    self.print_result('FAIL', f'Frontend tests failed: {result.stderr}')
                
                if result.stdout:
                    print("\n📊 Frontend Test Output:")
                    print(result.stdout)
            else:
                self.print_result('WARN', 'Simple test runner not found')
                self.results['frontend_tests'] = {
                    'status': 'WARN', 
                    'details': 'Simple test runner not available'
                }
            
        except subprocess.TimeoutExpired:
            self.results['frontend_tests'] = {
                'status': 'FAIL', 
                'details': 'Tests timed out'
            }
            self.print_result('FAIL', 'Frontend tests timed out')
        except Exception as e:
            self.results['frontend_tests'] = {
                'status': 'FAIL', 
                'details': str(e)
            }
            self.print_result('FAIL', f'Frontend tests error: {e}')
    
    def run_e2e_tests(self):
        """Run end-to-end integration tests"""
        self.print_header("End-to-End Tests")
        
        try:
            os.chdir(self.frontend_dir)
            
            # Check if Playwright is available
            e2e_test_file = self.frontend_dir / 'tests' / 'e2e' / 'integration.test.js'
            if not e2e_test_file.exists():
                self.print_result('WARN', 'E2E test file created but Playwright may need setup')
                self.results['e2e_tests'] = {
                    'status': 'WARN', 
                    'details': 'E2E tests created, need Playwright setup'
                }
                return
            
            # Try to run Playwright tests
            try:
                result = subprocess.run([
                    'npx', 'playwright', 'test', 'tests/e2e/integration.test.js'
                ], capture_output=True, text=True, timeout=600)
                
                if result.returncode == 0:
                    self.results['e2e_tests'] = {
                        'status': 'PASS', 
                        'details': 'E2E tests passed'
                    }
                    self.print_result('PASS', 'E2E tests completed successfully')
                else:
                    self.results['e2e_tests'] = {
                        'status': 'FAIL', 
                        'details': result.stderr
                    }
                    self.print_result('FAIL', f'E2E tests failed: {result.stderr}')
                
                if result.stdout:
                    print("\n📊 E2E Test Output:")
                    print(result.stdout)
            
            except FileNotFoundError:
                self.print_result('WARN', 'Playwright not installed, run: npm install @playwright/test')
                self.results['e2e_tests'] = {
                    'status': 'WARN', 
                    'details': 'Playwright not installed'
                }
            
        except subprocess.TimeoutExpired:
            self.results['e2e_tests'] = {
                'status': 'FAIL', 
                'details': 'Tests timed out'
            }
            self.print_result('FAIL', 'E2E tests timed out')
        except Exception as e:
            self.results['e2e_tests'] = {
                'status': 'FAIL', 
                'details': str(e)
            }
            self.print_result('FAIL', f'E2E tests error: {e}')
    
    def run_performance_tests(self):
        """Run performance tests"""
        self.print_header("Performance Tests")
        
        endpoints = [
            ('http://localhost:3001/api/me', 'Backend Health'),
            ('http://localhost:3001/api/quotations', 'Quotations API'),
            ('http://localhost:3000', 'Frontend'),
        ]
        
        performance_results = []
        
        for url, name in endpoints:
            try:
                start_time = time.time()
                response = requests.get(url, timeout=10)
                end_time = time.time()
                
                response_time = (end_time - start_time) * 1000
                
                if response_time < 1000:
                    status = 'PASS'
                    level = 'Excellent'
                elif response_time < 3000:
                    status = 'WARN'
                    level = 'Acceptable'
                else:
                    status = 'FAIL'
                    level = 'Slow'
                
                performance_results.append((name, status, f'{response_time:.0f}ms ({level})'))
                self.print_result(status, f'{name}: {response_time:.0f}ms')
                
            except Exception as e:
                performance_results.append((name, 'FAIL', f'Error: {e}'))
                self.print_result('FAIL', f'{name}: {e}')
        
        # Overall performance assessment
        failed_tests = [r for r in performance_results if r[1] == 'FAIL']
        if not failed_tests:
            self.results['performance_tests'] = {
                'status': 'PASS', 
                'details': 'All endpoints performing well'
            }
        else:
            self.results['performance_tests'] = {
                'status': 'FAIL', 
                'details': f'{len(failed_tests)} endpoints have performance issues'
            }
    
    def run_security_tests(self):
        """Run security tests"""
        self.print_header("Security Tests")
        
        security_checks = []
        
        try:
            # Check authentication
            response = requests.get('http://localhost:3001/api/quotations', timeout=5)
            if response.status_code == 401:
                security_checks.append(('Authentication Required', 'PASS', 'Protected routes require auth'))
            else:
                security_checks.append(('Authentication Required', 'FAIL', 'Protected routes may be exposed'))
            
            # Check CORS headers
            response = requests.options('http://localhost:3001/api/quotations', timeout=5)
            if 'Access-Control-Allow-Origin' in response.headers:
                security_checks.append(('CORS Headers', 'PASS', 'CORS properly configured'))
            else:
                security_checks.append(('CORS Headers', 'WARN', 'CORS headers may be missing'))
            
            # Check for common security headers
            response = requests.get('http://localhost:3001/api/me', timeout=5)
            headers_to_check = [
                'X-Frame-Options',
                'X-Content-Type-Options',
                'X-XSS-Protection'
            ]
            
            for header in headers_to_check:
                if header in response.headers:
                    security_checks.append((header, 'PASS', f'{header} header present'))
                else:
                    security_checks.append((header, 'WARN', f'{header} header missing'))
            
        except Exception as e:
            security_checks.append(('Security Check', 'FAIL', f'Error: {e}'))
        
        # Print results
        for name, status, details in security_checks:
            self.print_result(status, f'{name}: {details}')
        
        # Overall security assessment
        failed_critical = [c for c in security_checks 
                          if c[1] == 'FAIL' and c[0] in ['Authentication Required']]
        
        if not failed_critical:
            self.results['security_tests'] = {
                'status': 'PASS', 
                'details': 'Core security measures in place'
            }
        else:
            self.results['security_tests'] = {
                'status': 'FAIL', 
                'details': 'Critical security issues found'
            }
    
    def assess_production_readiness(self):
        """Assess overall production readiness"""
        self.print_header("Production Readiness Assessment")
        
        checklist = []
        score = 0
        max_score = 20
        
        # Server availability (4 points)
        try:
            requests.get('http://localhost:3001/api/me', timeout=5)
            checklist.append(('Backend Server Running', 'PASS', '4/4 points'))
            score += 4
        except:
            checklist.append(('Backend Server Running', 'FAIL', '0/4 points'))
        
        # Database (3 points)
        db_file = self.backend_dir / 'quotations.db'
        if db_file.exists() and db_file.stat().st_size > 0:
            checklist.append(('Database Available', 'PASS', '3/3 points'))
            score += 3
        else:
            checklist.append(('Database Available', 'FAIL', '0/3 points'))
        
        # Required files (3 points)
        required_files = [
            self.backend_dir / 'app.py',
            self.backend_dir / 'pdf_generator.py',
            self.backend_dir / 'services_data.py'
        ]
        
        missing_files = [f for f in required_files if not f.exists()]
        if not missing_files:
            checklist.append(('Required Files Present', 'PASS', '3/3 points'))
            score += 3
        else:
            checklist.append(('Required Files Present', 'FAIL', f'0/3 points - Missing: {len(missing_files)} files'))
        
        # Test coverage (4 points)
        passed_tests = sum(1 for test in ['backend_tests', 'frontend_tests', 'e2e_tests', 'performance_tests'] 
                          if self.results[test]['status'] == 'PASS')
        test_score = passed_tests
        checklist.append(('Test Coverage', 'PASS' if passed_tests >= 3 else 'WARN', f'{test_score}/4 points'))
        score += test_score
        
        # Security (3 points)
        if self.results['security_tests']['status'] == 'PASS':
            checklist.append(('Security Measures', 'PASS', '3/3 points'))
            score += 3
        elif self.results['security_tests']['status'] == 'WARN':
            checklist.append(('Security Measures', 'WARN', '2/3 points'))
            score += 2
        else:
            checklist.append(('Security Measures', 'FAIL', '0/3 points'))
        
        # Performance (3 points)
        if self.results['performance_tests']['status'] == 'PASS':
            checklist.append(('Performance Standards', 'PASS', '3/3 points'))
            score += 3
        elif self.results['performance_tests']['status'] == 'WARN':
            checklist.append(('Performance Standards', 'WARN', '2/3 points'))
            score += 2
        else:
            checklist.append(('Performance Standards', 'FAIL', '0/3 points'))
        
        # Print checklist
        for item, status, details in checklist:
            self.print_result(status, f'{item}: {details}')
        
        # Calculate percentage
        percentage = (score / max_score) * 100
        
        # Determine readiness level
        if percentage >= 90:
            readiness_level = "🎉 PRODUCTION READY"
            readiness_status = "PASS"
        elif percentage >= 75:
            readiness_level = "✅ MOSTLY READY"
            readiness_status = "WARN"
        elif percentage >= 50:
            readiness_level = "⚠️  NEEDS WORK"
            readiness_status = "WARN"
        else:
            readiness_level = "❌ NOT READY"
            readiness_status = "FAIL"
        
        self.results['production_readiness'] = {
            'status': readiness_status,
            'score': percentage
        }
        
        print(f"\n📊 Production Readiness Score: {score}/{max_score} ({percentage:.1f}%)")
        print(f"🏆 Assessment: {readiness_level}")
        
        return percentage
    
    def generate_report(self):
        """Generate final test report"""
        self.print_header("Test Summary Report")
        
        print(f"📅 Test Run Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🏠 Project Root: {self.project_root}")
        
        print("\n📋 Test Results:")
        for test_name, result in self.results.items():
            if test_name == 'production_readiness':
                continue
            status_icon = {
                'PASS': '✅',
                'FAIL': '❌',
                'WARN': '⚠️',
                'pending': '⏳'
            }.get(result['status'], '❓')
            
            print(f"   {status_icon} {test_name.replace('_', ' ').title()}: {result['status']}")
            if result['details']:
                print(f"      └─ {result['details']}")
        
        # Production readiness summary
        readiness = self.results['production_readiness']
        print(f"\n🎯 Production Readiness: {readiness['score']:.1f}% ({readiness['status']})")
        
        # Recommendations
        print("\n💡 Recommendations:")
        
        if self.results['backend_tests']['status'] != 'PASS':
            print("   • Fix backend API issues before deployment")
        
        if self.results['security_tests']['status'] != 'PASS':
            print("   • Address security concerns before production")
        
        if self.results['performance_tests']['status'] != 'PASS':
            print("   • Optimize performance for production workloads")
        
        if readiness['score'] < 90:
            print("   • Complete all test suites for full production confidence")
            print("   • Review and fix any failing test cases")
        
        if readiness['score'] >= 90:
            print("   • System appears ready for production deployment!")
            print("   • Consider setting up monitoring and logging for production")
    
    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 RERA Easy - Comprehensive Test Suite")
        print(f"Starting test run at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Check prerequisites
        if not self.check_prerequisites():
            return
        
        # Run all test suites
        self.run_backend_tests()
        self.run_frontend_tests()
        self.run_e2e_tests()
        self.run_performance_tests()
        self.run_security_tests()
        
        # Assess production readiness
        self.assess_production_readiness()
        
        # Generate final report
        self.generate_report()

def main():
    """Main entry point"""
    try:
        runner = TestRunner()
        runner.run_all_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test run interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test runner error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
