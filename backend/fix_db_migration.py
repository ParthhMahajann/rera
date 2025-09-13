import sqlite3
import os

def add_display_mode_column():
    """Add display_mode column to quotation table"""
    db_path = 'quotations.db'
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return False
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if display_mode column already exists
        cursor.execute("PRAGMA table_info(quotation);")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'display_mode' in columns:
            print("✅ display_mode column already exists")
            return True
            
        # Add the display_mode column
        cursor.execute("ALTER TABLE quotation ADD COLUMN display_mode VARCHAR(20) DEFAULT 'bifurcated';")
        
        # Update existing quotations to have the default value
        cursor.execute("UPDATE quotation SET display_mode = 'bifurcated' WHERE display_mode IS NULL;")
        
        conn.commit()
        print("✅ Successfully added display_mode column to quotation table")
        
        # Verify the column was added
        cursor.execute("PRAGMA table_info(quotation);")
        columns = [col[1] for col in cursor.fetchall()]
        if 'display_mode' in columns:
            print("✅ Verified: display_mode column exists")
            return True
        else:
            print("❌ Failed to add display_mode column")
            return False
            
    except Exception as e:
        print(f"❌ Error adding display_mode column: {str(e)}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔧 Fixing database migration...")
    if add_display_mode_column():
        print("🎉 Database migration completed successfully!")
    else:
        print("❌ Database migration failed!")
