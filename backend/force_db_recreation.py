#!/usr/bin/env python3

import os
import sys
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash
from datetime import datetime
from sqlalchemy.ext.mutable import MutableList

# Create Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quotations.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-secret-key'

db = SQLAlchemy(app)

# Define models exactly as they are in app.py
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fname = db.Column(db.String(80), nullable=True)
    lname = db.Column(db.String(80), nullable=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default="user")
    threshold = db.Column(db.Float, default=0.0)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

class Quotation(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    developer_type = db.Column(db.String(20), nullable=False)
    project_region = db.Column(db.String(100), nullable=False)
    plot_area = db.Column(db.Float, nullable=False)
    developer_name = db.Column(db.String(200), nullable=False)
    project_name = db.Column(db.String(200))
    contact_mobile = db.Column(db.String(15))
    contact_email = db.Column(db.String(100))
    validity = db.Column(db.String(20), default='7 days')
    payment_schedule = db.Column(db.String(10), default='50%')
    rera_number = db.Column(db.String(50))
    headers = db.Column(MutableList.as_mutable(db.JSON))
    pricing_breakdown = db.Column(MutableList.as_mutable(db.JSON))
    applicable_terms = db.Column(MutableList.as_mutable(db.JSON))
    custom_terms = db.Column(MutableList.as_mutable(db.JSON))
    total_amount = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    discount_percent = db.Column(db.Float, default=0.0)
    service_summary = db.Column(db.Text)
    created_by = db.Column(db.String(200))
    status = db.Column(db.String(20), default='draft')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    terms_accepted = db.Column(db.Boolean, default=False, nullable=False)
    requires_approval = db.Column(db.Boolean, default=False)
    approved_by = db.Column(db.String(100))
    approved_at = db.Column(db.DateTime)
    display_mode = db.Column(db.String(20), default='bifurcated')  # THIS IS THE KEY COLUMN

def force_recreate_tables():
    """Force recreation of all database tables"""
    with app.app_context():
        try:
            print("🔧 Starting database table recreation...")
            
            # Remove the database file entirely from instance directory
            db_path = 'instance/quotations.db'
            if os.path.exists(db_path):
                os.remove(db_path)
                print("✅ Removed existing database file")
            
            # Create all tables from scratch with SQLAlchemy
            db.create_all()
            print("✅ Created all tables with fresh schema")
            
            # Create admin user only if it doesn't exist
            admin_user = User.query.filter_by(username='admin').first()
            if not admin_user:
                admin_user = User(
                    fname='System',
                    lname='Administrator',
                    username='admin',
                    role='admin',
                    threshold=100.0
                )
                admin_user.set_password('1234')
                db.session.add(admin_user)
                db.session.commit()
                print("✅ Created new admin user")
            else:
                print("✅ Admin user already exists")
            
            print("✅ Created admin user:")
            print("   Username: admin")
            print("   Password: 1234")
            print("   Role: admin")
            
            # Verify the schema
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            
            # Check User table
            user_columns = inspector.get_columns('user')
            print(f"✅ User table has {len(user_columns)} columns")
            
            # Check Quotation table
            quotation_columns = inspector.get_columns('quotation')
            quotation_column_names = [col['name'] for col in quotation_columns]
            print(f"✅ Quotation table has {len(quotation_columns)} columns")
            
            if 'display_mode' in quotation_column_names:
                print("✅ display_mode column confirmed in quotation table!")
                return True
            else:
                print("❌ display_mode column NOT found!")
                print(f"Available columns: {quotation_column_names}")
                return False
                
        except Exception as e:
            print(f"❌ Error during table recreation: {str(e)}")
            return False

if __name__ == "__main__":
    if force_recreate_tables():
        print("=" * 50)
        print("🎉 Database recreation completed successfully!")
        print("🔄 Your Flask app should now work properly")
    else:
        print("=" * 50)
        print("❌ Database recreation failed!")
