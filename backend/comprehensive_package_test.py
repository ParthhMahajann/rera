#!/usr/bin/env python3
"""
Comprehensive Package Pricing Test
Tests all Package A/B/C/D combinations across all categories and locations
"""

import json
from services_data import ServicesDataManager

def test_comprehensive_package_pricing():
    """Test Package pricing across all categories and locations"""
    
    print("🔍 Comprehensive Package Pricing Test")
    print("=" * 80)
    
    # Load pricing data
    try:
        with open('pricing_data.json', 'r') as f:
            pricing_data = json.load(f)
    except FileNotFoundError:
        print("❌ pricing_data.json not found!")
        return False
    
    services_manager = ServicesDataManager()
    
    # Extract all package entries from JSON
    package_entries = {}
    for item in pricing_data:
        service_name = item.get('Service', '').strip()
        if service_name in ['Package A', 'Package B', 'Package C', 'Package D']:
            key = (
                item.get('Developer Type '),
                item.get('Project location '),
                item.get('Plot Area'),
                service_name
            )
            package_entries[key] = item.get('Amount')
    
    print(f"📋 Found {len(package_entries)} package combinations in JSON")
    
    # Test each package entry
    total_tests = 0
    passed_tests = 0
    failed_tests = []
    
    for (category, location, plot_area, package_name), expected_amount in package_entries.items():
        total_tests += 1
        
        # Convert plot area band to numeric value for testing
        plot_area_numeric = {
            "0-500": 300,
            "500-2000": 1000,
            "2000-4000": 3000,
            "4000-6500": 5000,
            "6500 and above": 7000
        }.get(plot_area, 300)
        
        # Test the pricing lookup
        result = services_manager._find_pricing_from_array(
            category.lower(),
            location,
            plot_area_numeric,
            package_name,
            pricing_data
        )
        
        # Handle expected amount
        expected_numeric = 0 if expected_amount == '-' or expected_amount == '' else float(expected_amount)
        
        # Check if result matches expectation
        match = abs(result - expected_numeric) < 0.01
        
        if match:
            passed_tests += 1
        else:
            failed_tests.append({
                'category': category,
                'location': location,
                'plot_area': plot_area,
                'package': package_name,
                'expected': expected_numeric,
                'got': result
            })
    
    # Test quotation calculation with packages
    print(f"\\n🧪 Testing quotation calculation with all packages...")
    
    test_scenarios = [
        {
            'category': 'category 1',
            'location': 'Mumbai City',
            'plot_area': 300,
            'packages': ['Package A', 'Package B', 'Package C']
        },
        {
            'category': 'category 2', 
            'location': 'Mumbai Suburban',
            'plot_area': 1000,
            'packages': ['Package A', 'Package B']
        },
        {
            'category': 'category 3',
            'location': 'Navi Mumbai',
            'plot_area': 300,
            'packages': ['Package A']
        }
    ]
    
    quotation_tests_passed = 0
    quotation_tests_total = 0
    
    for scenario in test_scenarios:
        for package in scenario['packages']:
            quotation_tests_total += 1
            
            # Create test header
            test_headers = [{
                'header': package,
                'name': package,
                'services': []
            }]
            
            # Test pricing calculation
            result = services_manager.calculate_enhanced_pricing(
                scenario['category'],
                scenario['location'],
                scenario['plot_area'],
                test_headers,
                pricing_data
            )
            
            if result.get('success') and len(result.get('breakdown', [])) > 0:
                breakdown = result['breakdown'][0]
                header_total = breakdown.get('headerTotal', 0)
                services_count = len(breakdown.get('services', []))
                
                # For packages, we expect exactly 1 service (the package itself)
                if services_count == 1 and header_total > 0:
                    quotation_tests_passed += 1
                    print(f"✅ {package} for {scenario['category'].title()}, {scenario['location']}: {header_total}")
                else:
                    print(f"❌ {package} for {scenario['category'].title()}, {scenario['location']}: Expected 1 service, got {services_count}, total: {header_total}")
            else:
                print(f"❌ {package} for {scenario['category'].title()}, {scenario['location']}: Calculation failed")
    
    # Summary
    print(f"\\n" + "=" * 80)
    print(f"🎯 COMPREHENSIVE PACKAGE PRICING TEST RESULTS:")
    print(f"📊 Individual Price Lookups:")
    print(f"   Total Tests: {total_tests}")
    print(f"   ✅ Passed: {passed_tests}")
    print(f"   ❌ Failed: {len(failed_tests)}")
    print(f"   Success Rate: {passed_tests/total_tests*100:.1f}%")
    
    print(f"\\n📊 Quotation Calculations:")
    print(f"   Total Tests: {quotation_tests_total}")
    print(f"   ✅ Passed: {quotation_tests_passed}")
    print(f"   ❌ Failed: {quotation_tests_total - quotation_tests_passed}")
    print(f"   Success Rate: {quotation_tests_passed/quotation_tests_total*100:.1f}%")
    
    if failed_tests:
        print(f"\\n❌ Failed Tests:")
        for failure in failed_tests[:10]:  # Show first 10 failures
            print(f"   {failure['category']} | {failure['location']} | {failure['plot_area']} | {failure['package']}")
            print(f"      Expected: {failure['expected']}, Got: {failure['got']}")
    
    overall_success = len(failed_tests) == 0 and quotation_tests_passed == quotation_tests_total
    
    print(f"\\n" + "=" * 80)
    if overall_success:
        print("🎉 ALL PACKAGE PRICING TESTS PASSED!")
        print("✅ Package A, B, C, D are loading correctly from JSON")
        print("✅ Single package prices are used (not expanded service totals)")
        print("✅ All category/location/plot area combinations work correctly")
    else:
        print("⚠️  SOME PACKAGE PRICING TESTS FAILED!")
        
    return overall_success

if __name__ == "__main__":
    success = test_comprehensive_package_pricing()
    exit(0 if success else 1)
