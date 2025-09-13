import sqlite3
from werkzeug.security import generate_password_hash

def reset_admin_password():
    """Reset admin password to 'admin'"""
    conn = sqlite3.connect('quotations.db')
    cursor = conn.cursor()
    
    try:
        # Generate new password hash for 'admin'
        new_password = "1234"
        password_hash = generate_password_hash(new_password)
        
        # Update admin user password
        cursor.execute("UPDATE user SET password_hash = ? WHERE username = 'admin';", (password_hash,))
        
        if cursor.rowcount > 0:
            conn.commit()
            print(f"✅ Admin password reset successfully")
            print(f"   Username: admin")
            print(f"   Password: 1234")
            return True
        else:
            print("❌ Admin user not found")
            return False
            
    except Exception as e:
        print(f"❌ Error resetting admin password: {str(e)}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔧 Resetting admin password...")
    if reset_admin_password():
        print("🎉 Admin password reset completed!")
    else:
        print("❌ Admin password reset failed!")
