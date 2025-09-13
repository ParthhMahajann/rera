#!/usr/bin/env python3
"""
Database migration script to add display_mode column to existing quotations table
"""

import sys
import os
sys.path.append('backend')

from backend.app import app, db
from sqlalchemy import text

def migrate_database():
    """Add display_mode column to quotations table"""
    
    print("🔄 Starting database migration...")
    
    with app.app_context():
        try:
            # Check if display_mode column already exists (SQLite version)
            result = db.session.execute(text("""
                PRAGMA table_info(quotation)
            """))
            
            columns = result.fetchall()
            column_exists = any(column[1] == 'display_mode' for column in columns)
            
            if column_exists:
                print("✅ display_mode column already exists - no migration needed")
                return True
            
            print("📝 Adding display_mode column to quotation table...")
            
            # Add the display_mode column with default value
            db.session.execute(text("""
                ALTER TABLE quotation 
                ADD COLUMN display_mode VARCHAR(20) DEFAULT 'bifurcated'
            """))
            
            # Update existing records to have the default value
            db.session.execute(text("""
                UPDATE quotation 
                SET display_mode = 'bifurcated' 
                WHERE display_mode IS NULL
            """))
            
            db.session.commit()
            print("✅ Successfully added display_mode column")
            
            # Verify the migration
            result = db.session.execute(text("SELECT COUNT(*) FROM quotation"))
            count = result.fetchone()[0]
            print(f"✅ Migration verified - {count} quotations updated")
            
            return True
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            db.session.rollback()
            return False

def create_tables_if_needed():
    """Create all tables if they don't exist"""
    
    print("🏗️ Ensuring database tables exist...")
    
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            print("✅ Database tables created/verified")
            return True
        except Exception as e:
            print(f"❌ Table creation failed: {e}")
            return False

def main():
    """Run the complete database setup"""
    
    print("🚀 Database Migration for Display Mode Support")
    print("=" * 50)
    
    # Step 1: Create tables if needed
    tables_ok = create_tables_if_needed()
    if not tables_ok:
        print("❌ Failed to create/verify tables")
        return False
    
    # Step 2: Add display_mode column
    migration_ok = migrate_database()
    if not migration_ok:
        print("❌ Migration failed")
        return False
    
    print("\n🎉 Database migration completed successfully!")
    print("📝 Changes made:")
    print("   - Added display_mode column to quotation table")  
    print("   - Set default value 'bifurcated' for existing quotations")
    print("   - All existing quotations can now save display mode")
    print("\n🔄 You can now restart your backend server!")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
