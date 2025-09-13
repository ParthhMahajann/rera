#!/usr/bin/env python3
"""
Package Pricing Specific Test
Tests Package A, B, C, D pricing to ensure they load correctly since they are services in JSON
"""

import json
from services_data import ServicesDataManager

def test_package_pricing():
    """Test Package A, B, C, D pricing specifically"""
    
    print("🔍 Loading pricing data and testing Package pricing...")
    
    # Load pricing data
    try:
        with open('backend/pricing_data.json', 'r') as f:
            pricing_data = json.load(f)
    except FileNotFoundError:
        try:
            with open('pricing_data.json', 'r') as f:
                pricing_data = json.load(f)
        except FileNotFoundError:
            print("❌ pricing_data.json not found!")
            return False
    
    services_manager = ServicesDataManager()
    
    # Test scenarios for all packages
    test_scenarios = [
        # Category 1, Mumbai City, 0-500 plot area
        {
            'category': 'category 1',
            'location': 'Mumbai City', 
            'plot_area': 300,
            'expected_prices': {
                'Package A': 130000,
                'Package B': 160000,
                'Package C': 170000,
                'Package D': '-'  # Should return 0
            }
        },
        # Category 2, Mumbai City, 0-500 plot area
        {
            'category': 'category 2',
            'location': 'Mumbai City',
            'plot_area': 300,
            'expected_prices': {
                'Package A': 120000,
                'Package B': 150000,
                'Package C': 160000,
                'Package D': '-'  # Should return 0
            }
        },
        # Category 3, Mumbai City, 0-500 plot area
        {
            'category': 'category 3',
            'location': 'Mumbai City',
            'plot_area': 300,
            'expected_prices': {
                'Package A': 110000,
                'Package B': 140000,
                'Package C': 150000,
                'Package D': '-'  # Should return 0
            }
        }
    ]
    
    all_passed = True
    total_tests = 0
    passed_tests = 0
    
    print("🧪 Testing Package pricing for different scenarios...")
    print("=" * 80)
    
    for i, scenario in enumerate(test_scenarios, 1):
        print(f"\n📋 Scenario {i}: {scenario['category'].title()}, {scenario['location']}, plot area {scenario['plot_area']}")
        print("-" * 60)
        
        for package_name, expected_price in scenario['expected_prices'].items():
            total_tests += 1
            
            # Test the package pricing
            result = services_manager._find_pricing_from_array(
                scenario['category'],
                scenario['location'], 
                scenario['plot_area'],
                package_name,
                pricing_data
            )
            
            # Handle expected dash values
            expected_numeric = 0 if expected_price == '-' else float(expected_price)
            
            # Check if result matches expectation
            match = abs(result - expected_numeric) < 0.01
            
            if match:
                passed_tests += 1
                status = "✅ PASS"
                print(f"{status} {package_name:<12} | Expected: {expected_numeric:<10} | Got: {result}")
            else:
                all_passed = False
                status = "❌ FAIL"
                print(f"{status} {package_name:<12} | Expected: {expected_numeric:<10} | Got: {result}")
    
    print("\n" + "=" * 80)
    print(f"🎯 PACKAGE PRICING TEST SUMMARY:")
    print(f"Total Tests: {total_tests}")
    print(f"✅ Passed: {passed_tests}")
    print(f"❌ Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {passed_tests/total_tests*100:.1f}%")
    
    # Now test how packages work in the actual quotation calculation
    print(f"\n🔧 Testing Package expansion in quotation calculation...")
    
    # Test Package A expansion
    test_headers = [
        {
            'header': 'Package A',
            'name': 'Package A',
            'services': []  # Package headers don't have services initially - they get expanded
        }
    ]
    
    # Test pricing calculation for Package A
    result = services_manager.calculate_enhanced_pricing(
        'category 1',
        'Mumbai City', 
        300,
        test_headers,
        pricing_data
    )
    
    print(f"\n📊 Package A Calculation Result:")
    print(f"Success: {result.get('success', False)}")
    print(f"Total Services: {result.get('summary', {}).get('totalServices', 0)}")
    print(f"Subtotal: {result.get('summary', {}).get('subtotal', 0)}")
    
    if result.get('breakdown'):
        for breakdown_item in result['breakdown']:
            if breakdown_item.get('header') == 'Package A':
                print(f"Package A Header Total: {breakdown_item.get('headerTotal', 0)}")
                print(f"Services in Package A: {len(breakdown_item.get('services', []))}")
                
                # Check if Package A pricing is used directly or if it's calculated from sub-services
                for service in breakdown_item.get('services', [])[:3]:  # Show first 3 services
                    print(f"  - {service.get('name', 'Unknown')}: {service.get('totalAmount', 0)}")
    
    # Check JSON for actual Package entries
    print(f"\n📋 Checking JSON for Package entries...")
    package_entries = []
    for item in pricing_data:
        service_name = item.get('Service', '').strip()
        if 'Package' in service_name and service_name in ['Package A', 'Package B', 'Package C', 'Package D']:
            package_entries.append({
                'category': item.get('Developer Type '),
                'location': item.get('Project location '),
                'plot_area': item.get('Plot Area'),
                'service': service_name,
                'amount': item.get('Amount')
            })
    
    print(f"Found {len(package_entries)} package entries in JSON:")
    for entry in package_entries[:10]:  # Show first 10
        print(f"  {entry['category']} | {entry['location']} | {entry['plot_area']} | {entry['service']} = {entry['amount']}")
    
    if len(package_entries) > 10:
        print(f"  ... and {len(package_entries) - 10} more")
    
    print(f"\n" + "=" * 80)
    
    if all_passed:
        print("🎉 ALL PACKAGE PRICING TESTS PASSED!")
        return True
    else:
        print("⚠️  SOME PACKAGE PRICING TESTS FAILED!")
        return False

if __name__ == "__main__":
    success = test_package_pricing()
    exit(0 if success else 1)
