#!/usr/bin/env python3
"""
Script to run database migrations
"""
import psycopg2
import os
from pathlib import Path

def run_migration():
    """Run the database migration"""
    try:
        # Database connection parameters
        conn_params = {
            'host': 'localhost',
            'port': 5432,
            'database': 'local',
            'user': 'postgres',
            'password': 'password'
        }
        
        print("🔌 Connecting to PostgreSQL database...")
        conn = psycopg2.connect(**conn_params)
        cursor = conn.cursor()
        
        print("📄 Reading migration file...")
        migration_file = Path(__file__).parent / "migrations" / "001_create_users_table.sql"
        
        with open(migration_file, 'r') as f:
            migration_sql = f.read()
        
        print("🚀 Running migration...")
        cursor.execute(migration_sql)
        conn.commit()
        
        print("✅ Migration completed successfully!")
        
        # Show created users
        cursor.execute("SELECT id, email, full_name, is_active, created_at FROM users;")
        users = cursor.fetchall()
        
        print("\n👥 Created users:")
        for user in users:
            print(f"  - ID: {user[0]}, Email: {user[1]}, Name: {user[2]}, Active: {user[3]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    run_migration()
