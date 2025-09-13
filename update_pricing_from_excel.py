#!/usr/bin/env python3
"""
Script to convert Excel pricing data to JSON format
Run this script after placing your Excel file in the same directory
"""

import pandas as pd
import json
import sys
import os
from pathlib import Path

def convert_excel_to_json(excel_file_path, output_json_path):
    """
    Convert Excel pricing data to the required JSON format
    """
    try:
        # Read the Excel file
        print(f"Reading Excel file: {excel_file_path}")
        
        # Read all sheets - adjust sheet names as needed
        excel_data = pd.read_excel(excel_file_path, sheet_name=None)
        
        print(f"Found sheets: {list(excel_data.keys())}")
        
        # Initialize the pricing structure
        pricing_data = {
            "Category 1": {},
            "Category 2": {}
        }
        
        # Define regions and plot area ranges
        regions = ["Mumbai City", "ROM", "Mumbai Suburban", "Navi Mumbai", "Raigad"]
        plot_ranges = ["0-500", "500-2000", "2000-4000", "4000-6500", "6500 and above"]
        
        # Process each sheet
        for sheet_name, df in excel_data.items():
            print(f"Processing sheet: {sheet_name}")
            
            # Skip if sheet is empty or doesn't contain pricing data
            if df.empty:
                continue
            
            # Print column names for debugging
            print(f"Columns in {sheet_name}: {list(df.columns)}")
            
            # You'll need to adjust this based on your Excel structure
            # Example processing (adjust according to your Excel format):
            
            for index, row in df.iterrows():
                # Skip header rows or empty rows
                if pd.isna(row.iloc[0]) or str(row.iloc[0]).startswith('Service'):
                    continue
                    
                service_name = str(row.iloc[0])  # Assuming first column is service name
                
                # Process each region and plot range combination
                # You'll need to adjust column indices based on your Excel layout
                
                # Example: assuming columns are organized as:
                # Col 0: Service Name
                # Col 1-5: Mumbai City (0-500, 500-2000, 2000-4000, 4000-6500, 6500+)
                # Col 6-10: ROM (same ranges)
                # etc.
                
                col_index = 1
                for region in regions:
                    for plot_range in plot_ranges:
                        if col_index < len(row):
                            amount = row.iloc[col_index]
                            
                            # Initialize nested structure if needed
                            if region not in pricing_data["Category 1"]:
                                pricing_data["Category 1"][region] = {}
                            if plot_range not in pricing_data["Category 1"][region]:
                                pricing_data["Category 1"][region][plot_range] = {}
                            
                            # Add the pricing data
                            if pd.notna(amount) and amount != 0:
                                pricing_data["Category 1"][region][plot_range][service_name] = {
                                    "amount": int(amount) if isinstance(amount, (int, float)) else 50000,
                                    "rating": 1.0 if region == "Mumbai City" else 
                                             2.0 if region == "Mumbai Suburban" else
                                             3.0 if region == "Navi Mumbai" else
                                             4.0 if region == "Raigad" else 5.0
                                }
                        
                        col_index += 1
        
        # Copy Category 1 structure to Category 2 with adjusted pricing
        pricing_data["Category 2"] = {}
        for region, region_data in pricing_data["Category 1"].items():
            pricing_data["Category 2"][region] = {}
            for plot_range, services in region_data.items():
                pricing_data["Category 2"][region][plot_range] = {}
                for service_name, service_data in services.items():
                    # Category 2 typically has slightly lower pricing
                    adjusted_amount = int(service_data["amount"] * 0.9)  # 10% reduction
                    pricing_data["Category 2"][region][plot_range][service_name] = {
                        "amount": adjusted_amount,
                        "rating": service_data["rating"]
                    }
        
        # Write to JSON file
        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(pricing_data, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully converted Excel data to JSON: {output_json_path}")
        return True
        
    except Exception as e:
        print(f"Error converting Excel to JSON: {str(e)}")
        return False

def update_pricing_files():
    """
    Update both frontend and backend pricing files
    """
    script_dir = Path(__file__).parent
    excel_file = script_dir / "Pricing.xlsx"  # Adjust filename as needed
    
    if not excel_file.exists():
        print(f"Excel file not found: {excel_file}")
        print("Please place your Excel file in the script directory and name it 'Pricing.xlsx'")
        return False
    
    # Paths for JSON files
    frontend_json = script_dir / "frontend" / "src" / "data" / "pricing_data.json"
    backend_json = script_dir / "backend" / "pricing_data.json"
    
    # Convert Excel to JSON
    temp_json = script_dir / "temp_pricing.json"
    
    if convert_excel_to_json(excel_file, temp_json):
        # Copy to both locations
        try:
            with open(temp_json, 'r', encoding='utf-8') as f:
                pricing_data = json.load(f)
            
            # Update frontend file
            with open(frontend_json, 'w', encoding='utf-8') as f:
                json.dump(pricing_data, f, indent=2, ensure_ascii=False)
            print(f"Updated frontend pricing file: {frontend_json}")
            
            # Update backend file
            with open(backend_json, 'w', encoding='utf-8') as f:
                json.dump(pricing_data, f, indent=2, ensure_ascii=False)
            print(f"Updated backend pricing file: {backend_json}")
            
            # Remove temp file
            temp_json.unlink()
            
            print("Pricing data successfully updated!")
            return True
            
        except Exception as e:
            print(f"Error updating pricing files: {str(e)}")
            return False
    
    return False

if __name__ == "__main__":
    print("Excel to JSON Pricing Converter")
    print("=" * 40)
    
    if len(sys.argv) > 1:
        excel_file = sys.argv[1]
        output_file = "pricing_data.json"
        
        if len(sys.argv) > 2:
            output_file = sys.argv[2]
        
        convert_excel_to_json(excel_file, output_file)
    else:
        update_pricing_files()
