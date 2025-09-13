#!/usr/bin/env python3
"""
Comprehensive Pricing Validation Script
Tests all possible combinations from pricing_data.json to ensure correct pricing lookup
"""

import json
import sys
from collections import defaultdict
from services_data import ServicesDataManager

def load_pricing_data():
    """Load the pricing data from JSON file"""
    try:
        with open('pricing_data.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("ERROR: pricing_data.json not found!")
        sys.exit(1)

def extract_unique_values(pricing_data):
    """Extract all unique values for each field from the pricing data"""
    categories = set()
    locations = set()
    plot_areas = set()
    services = set()
    
    for item in pricing_data:
        categories.add(item.get('Developer Type '))
        locations.add(item.get('Project location '))
        plot_areas.add(item.get('Plot Area'))
        services.add(item.get('Service', '').strip())
    
    # Remove None values
    categories.discard(None)
    locations.discard(None)
    plot_areas.discard(None)
    services.discard(None)
    services.discard('')
    
    return sorted(categories), sorted(locations), sorted(plot_areas), sorted(services)

def get_plot_area_numeric_value(plot_area_band):
    """Convert plot area band to a numeric value for testing"""
    band_mapping = {
        "0-500": 250,
        "500-2000": 1000,
        "2000-4000": 3000,
        "4000-6500": 5000,
        "6500 and above": 7000
    }
    return band_mapping.get(plot_area_band, 250)

def test_pricing_lookup(services_manager, category, location, plot_area_band, service_name, expected_amount, pricing_data):
    """Test a single pricing lookup"""
    plot_area_numeric = get_plot_area_numeric_value(plot_area_band)
    
    # Convert category format (JSON has "Category 1" but we might pass "category 1")
    test_category = category.lower()
    
    try:
        result = services_manager._find_pricing_from_array(
            test_category, location, plot_area_numeric, service_name, pricing_data
        )
        
        # Handle special cases for expected amount
        if isinstance(expected_amount, str):
            if expected_amount == '-' or expected_amount.strip() == '':
                expected_numeric = 0
            else:
                try:
                    expected_numeric = float(expected_amount.replace(',', ''))
                except ValueError:
                    expected_numeric = 50000  # fallback
        else:
            expected_numeric = float(expected_amount) if expected_amount is not None else 50000
        
        return {
            'category': category,
            'location': location,
            'plot_area': plot_area_band,
            'service': service_name,
            'expected': expected_numeric,
            'actual': result,
            'match': abs(result - expected_numeric) < 0.01,  # Allow for floating point precision
            'error': None
        }
        
    except Exception as e:
        return {
            'category': category,
            'location': location,
            'plot_area': plot_area_band,
            'service': service_name,
            'expected': expected_amount,
            'actual': None,
            'match': False,
            'error': str(e)
        }

def main():
    """Main validation function"""
    print("🔍 Loading pricing data and initializing services manager...")
    
    # Load data and initialize manager
    pricing_data = load_pricing_data()
    services_manager = ServicesDataManager()
    
    print(f"✅ Loaded {len(pricing_data)} pricing entries")
    
    # Extract unique values
    categories, locations, plot_areas, services = extract_unique_values(pricing_data)
    
    print(f"📊 Found unique values:")
    print(f"   Categories: {len(categories)} - {categories}")
    print(f"   Locations: {len(locations)} - {locations}")
    print(f"   Plot Areas: {len(plot_areas)} - {plot_areas}")
    print(f"   Services: {len(services)} - {len(services)} services")
    
    print(f"\n🧪 Testing all {len(pricing_data)} actual combinations from JSON...")
    
    # Test results
    results = []
    matches = 0
    mismatches = 0
    errors = 0
    
    # Test each actual entry in the JSON
    for i, item in enumerate(pricing_data):
        category = item.get('Developer Type ')
        location = item.get('Project location ')
        plot_area = item.get('Plot Area')
        service = item.get('Service', '').strip()
        amount = item.get('Amount')
        
        if not all([category, location, plot_area, service]):
            print(f"⚠️  Skipping incomplete entry {i}: {item}")
            continue
            
        result = test_pricing_lookup(
            services_manager, category, location, plot_area, service, amount, pricing_data
        )
        results.append(result)
        
        if result['error']:
            errors += 1
            print(f"❌ ERROR [{i+1}]: {result['error']}")
            print(f"   Entry: {category} | {location} | {plot_area} | {service}")
        elif result['match']:
            matches += 1
            if i < 10 or i % 100 == 0:  # Show first 10 and every 100th
                print(f"✅ MATCH [{i+1}]: {service[:50]:<50} | Expected: {result['expected']:<10} | Got: {result['actual']}")
        else:
            mismatches += 1
            print(f"❌ MISMATCH [{i+1}]: {service[:50]:<50}")
            print(f"   Category: {category} | Location: {location} | Plot Area: {plot_area}")
            print(f"   Expected: {result['expected']} | Got: {result['actual']}")
    
    # Summary Report
    print(f"\n{'='*80}")
    print(f"🎯 VALIDATION SUMMARY")
    print(f"{'='*80}")
    print(f"Total Tests: {len(results)}")
    print(f"✅ Matches: {matches} ({matches/len(results)*100:.1f}%)")
    print(f"❌ Mismatches: {mismatches} ({mismatches/len(results)*100:.1f}%)")
    print(f"⚠️  Errors: {errors} ({errors/len(results)*100:.1f}%)")
    
    if mismatches > 0:
        print(f"\n🔍 MISMATCH ANALYSIS:")
        mismatch_by_service = defaultdict(list)
        mismatch_by_category = defaultdict(list)
        mismatch_by_location = defaultdict(list)
        
        for result in results:
            if not result['match'] and not result['error']:
                mismatch_by_service[result['service']].append(result)
                mismatch_by_category[result['category']].append(result)
                mismatch_by_location[result['location']].append(result)
        
        print(f"\n📈 Top mismatched services:")
        for service, mismatches_list in sorted(mismatch_by_service.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
            print(f"   {service[:60]:<60} : {len(mismatches_list)} mismatches")
            
        print(f"\n🏢 Mismatches by category:")
        for category, mismatches_list in sorted(mismatch_by_category.items(), key=lambda x: len(x[1]), reverse=True):
            print(f"   {category:<20} : {len(mismatches_list)} mismatches")
            
        print(f"\n📍 Mismatches by location:")
        for location, mismatches_list in sorted(mismatch_by_location.items(), key=lambda x: len(x[1]), reverse=True):
            print(f"   {location:<20} : {len(mismatches_list)} mismatches")
    
    # Test service name mappings
    print(f"\n🔄 TESTING SERVICE NAME MAPPINGS:")
    mapping_results = {}
    all_frontend_services = [
        "PROJECT REGISTRATION SERVICES", "LEGAL CONSULTATION", "CHANGE OF PROMOTER",
        "MAHARERA PROFILE UPDATION", "CORRECTION (CHANGE OF FSI)", "MAHARERA PROFILE MIGRATION",
        "REMOVAL FROM ABEYANCE (QPR)", "Extension of Project Completion Date U/S 7(3)",
        "PROJECT CLOSURE", "POST FACTO EXTENSION", "EXTENSION UNDER ORDER 40",
        "Correction (Change of Bank Account)", "Project De-registration", "CONSULTATION & ADVISORY SERVICES",
        "QUARTERLY PROGRESS REPORTS", "RERA PROFILE UPDATION & COMPLIANCE",
        "MAHARERA PROCESS-LINKED APPLICATION SUPPORT", "PROFESSIONAL CERTIFICATIONS",
        "RERA ANNUAL AUDIT CONSULTATION", "BESPOKE OFFERINGS", "Regulatory Hearing & Notices",
        "LIAISONING", "Legal Documentation", "Title Report", "Search Report", "SRO Membership",
        "Form 1", "Form 2", "Form 3", "Form 5"
    ]
    
    for frontend_service in all_frontend_services:
        mapped = services_manager._map_service_name(frontend_service)
        # Check if the mapped name exists in our services list
        exists_in_json = mapped in services
        mapping_results[frontend_service] = {
            'mapped_to': mapped,
            'exists_in_json': exists_in_json
        }
        
        status = "✅" if exists_in_json else "❌"
        print(f"{status} {frontend_service:<50} -> {mapped}")
    
    unmapped_services = [service for service in services if service not in [r['mapped_to'] for r in mapping_results.values()]]
    if unmapped_services:
        print(f"\n⚠️  Services in JSON but not mapped from frontend ({len(unmapped_services)}):")
        for service in unmapped_services[:20]:  # Show first 20
            print(f"   {service}")
        if len(unmapped_services) > 20:
            print(f"   ... and {len(unmapped_services) - 20} more")
    
    # Final result
    success_rate = matches / len(results) * 100 if results else 0
    print(f"\n{'='*80}")
    if success_rate >= 95:
        print(f"🎉 VALIDATION PASSED! Success rate: {success_rate:.1f}%")
        return 0
    else:
        print(f"⚠️  VALIDATION NEEDS ATTENTION! Success rate: {success_rate:.1f}%")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
