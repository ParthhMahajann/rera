import sqlite3
from werkzeug.security import check_password_hash
import jwt
from datetime import datetime, timedelta

def test_admin_login():
    """Test admin user authentication"""
    conn = sqlite3.connect('quotations.db')
    cursor = conn.cursor()
    
    # Get admin user
    cursor.execute("SELECT * FROM user WHERE username = 'admin';")
    admin_user = cursor.fetchone()
    
    if not admin_user:
        print("❌ Admin user not found!")
        return False
        
    print(f"✅ Admin user found: {admin_user[3]} (role: {admin_user[5]})")
    
    # Test password verification
    stored_hash = admin_user[4]  # password_hash column
    test_password = "1234"  # Default admin password
    
    if check_password_hash(stored_hash, test_password):
        print("✅ Admin password verification successful")
    else:
        print("❌ Admin password verification failed")
        return False
    
    # Test JWT token generation
    secret_key = 'dev-secret-key'
    payload = {
        "user_id": admin_user[0],
        "username": admin_user[3],
        "role": admin_user[5],
        "exp": datetime.utcnow() + timedelta(hours=12)
    }
    
    try:
        token = jwt.encode(payload, secret_key, algorithm="HS256")
        print(f"✅ JWT token generated successfully")
        
        # Test token decoding
        decoded = jwt.decode(token, secret_key, algorithms=["HS256"])
        print(f"✅ JWT token decoded successfully: {decoded['username']}")
        
    except Exception as e:
        print(f"❌ JWT token error: {str(e)}")
        return False
    
    conn.close()
    return True

if __name__ == "__main__":
    print("🔐 Testing authentication system...")
    if test_admin_login():
        print("🎉 Authentication system is working!")
    else:
        print("❌ Authentication system has issues!")
