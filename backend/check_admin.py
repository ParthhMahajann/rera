import sqlite3

conn = sqlite3.connect('quotations.db')
cursor = conn.cursor()

# Check admin user
cursor.execute("SELECT * FROM user WHERE username = 'admin';")
admin_user = cursor.fetchone()
print(f"Admin user: {admin_user}")

conn.close()
