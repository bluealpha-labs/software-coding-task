import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, Dict, Any
import os

class DatabaseService:
    def __init__(self):
        self.conn_params = {
            'host': os.getenv('POSTGRES_HOST', 'localhost'),
            'port': int(os.getenv('POSTGRES_PORT', 5432)),
            'database': os.getenv('POSTGRES_DB', 'local'),
            'user': os.getenv('POSTGRES_USER', 'postgres'),
            'password': os.getenv('POSTGRES_PASSWORD', 'password')
        }
    
    def get_connection(self):
        """Get database connection"""
        return psycopg2.connect(**self.conn_params)
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute(
                        "SELECT id, email, full_name, hashed_password, is_active, created_at FROM users WHERE email = %s",
                        (email,)
                    )
                    result = cursor.fetchone()
                    return dict(result) if result else None
        except Exception as e:
            print(f"Database error: {e}")
            return None
    
    def create_user(self, email: str, full_name: str, hashed_password: str) -> Optional[Dict[str, Any]]:
        """Create a new user"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute(
                        "INSERT INTO users (email, full_name, hashed_password) VALUES (%s, %s, %s) RETURNING id, email, full_name, is_active, created_at",
                        (email, full_name, hashed_password)
                    )
                    result = cursor.fetchone()
                    conn.commit()
                    return dict(result) if result else None
        except Exception as e:
            print(f"Database error: {e}")
            return None

# Global instance
db_service = DatabaseService()
