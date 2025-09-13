#!/usr/bin/env python3

import os
import sqlite3
from werkzeug.security import generate_password_hash
from datetime import datetime

def recreate_database():
    """Recreate the database with proper schema"""
    db_path = 'quotations.db'
    
    # Remove existing database
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"✅ Removed existing database: {db_path}")
    
    # Create new database with proper schema
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Create User table
        cursor.execute('''
            CREATE TABLE user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fname VARCHAR(80),
                lname VARCHAR(80),
                username VARCHAR(80) UNIQUE NOT NULL,
                password_hash VARCHAR(200) NOT NULL,
                role VARCHAR(20) DEFAULT 'user',
                threshold FLOAT DEFAULT 0.0
            )
        ''')
        print("✅ Created User table")
        
        # Create Quotation table with all required columns including display_mode
        cursor.execute('''
            CREATE TABLE quotation (
                id VARCHAR(50) PRIMARY KEY,
                developer_type VARCHAR(20) NOT NULL,
                project_region VARCHAR(100) NOT NULL,
                plot_area FLOAT NOT NULL,
                developer_name VARCHAR(200) NOT NULL,
                project_name VARCHAR(200),
                contact_mobile VARCHAR(15),
                contact_email VARCHAR(100),
                validity VARCHAR(20) DEFAULT '7 days',
                payment_schedule VARCHAR(10) DEFAULT '50%',
                rera_number VARCHAR(50),
                headers JSON,
                pricing_breakdown JSON,
                applicable_terms JSON,
                custom_terms JSON,
                total_amount FLOAT DEFAULT 0.0,
                discount_amount FLOAT DEFAULT 0.0,
                discount_percent FLOAT DEFAULT 0.0,
                service_summary TEXT,
                created_by VARCHAR(200),
                status VARCHAR(20) DEFAULT 'draft',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                terms_accepted BOOLEAN NOT NULL DEFAULT 0,
                requires_approval BOOLEAN DEFAULT 0,
                approved_by VARCHAR(100),
                approved_at DATETIME,
                display_mode VARCHAR(20) DEFAULT 'bifurcated'
            )
        ''')
        print("✅ Created Quotation table with display_mode column")
        
        # Create admin user
        admin_password = "1234"
        password_hash = generate_password_hash(admin_password)
        
        cursor.execute('''
            INSERT INTO user (fname, lname, username, password_hash, role, threshold)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('System', 'Administrator', 'admin', password_hash, 'admin', 100.0))
        
        print("✅ Created admin user")
        print("   Username: admin")
        print("   Password: 1234")
        print("   Role: admin")
        print("   Threshold: 100.0%")
        
        conn.commit()
        print("✅ Database transaction committed")
        
        # Verify the schema
        cursor.execute("PRAGMA table_info(user);")
        user_columns = cursor.fetchall()
        print(f"✅ User table has {len(user_columns)} columns")
        
        cursor.execute("PRAGMA table_info(quotation);")
        quotation_columns = cursor.fetchall()
        print(f"✅ Quotation table has {len(quotation_columns)} columns")
        
        # Verify display_mode column exists
        display_mode_exists = any(col[1] == 'display_mode' for col in quotation_columns)
        if display_mode_exists:
            print("✅ display_mode column confirmed in quotation table")
        else:
            print("❌ display_mode column NOT found in quotation table")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating database: {str(e)}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔧 Recreating database with proper schema...")
    print("=" * 50)
    
    if recreate_database():
        print("=" * 50)
        print("🎉 Database recreation completed successfully!")
        print("🔄 You can now start your Flask application")
    else:
        print("=" * 50)
        print("❌ Database recreation failed!")
