import sqlite3
import os

db_path = 'quotations.db'
print(f"Database file exists: {os.path.exists(db_path)}")

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"Tables: {tables}")
    
    # Check User table structure
    cursor.execute("PRAGMA table_info(user);")
    user_structure = cursor.fetchall()
    print(f"User table structure: {user_structure}")
    
    # Check if any users exist
    cursor.execute("SELECT COUNT(*) FROM user;")
    user_count = cursor.fetchone()[0]
    print(f"Number of users: {user_count}")
    
    if user_count > 0:
        cursor.execute("SELECT id, username, role FROM user;")
        users = cursor.fetchall()
        print(f"Users: {users}")
    
    # Check Quotation table structure  
    cursor.execute("PRAGMA table_info(quotation);")
    quotation_structure = cursor.fetchall()
    print(f"Quotation table structure: {quotation_structure}")
    
    conn.close()
else:
    print("Database file does not exist!")
