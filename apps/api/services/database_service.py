import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from typing import Optional, Dict, Any
import os
import logging

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.conn_params = {
            'host': os.getenv('POSTGRES_HOST', 'localhost'),
            'port': int(os.getenv('POSTGRES_PORT', 5432)),
            'database': os.getenv('POSTGRES_DB', 'local'),
            'user': os.getenv('POSTGRES_USER', 'postgres'),
            'password': os.getenv('POSTGRES_PASSWORD', 'password')
        }
        
        # Initialize connection pool
        try:
            from api.constants import DB_POOL_MIN_CONNECTIONS, DB_POOL_MAX_CONNECTIONS
            self.connection_pool = psycopg2.pool.ThreadedConnectionPool(
                minconn=DB_POOL_MIN_CONNECTIONS,
                maxconn=DB_POOL_MAX_CONNECTIONS,
                **self.conn_params
            )
            logger.info("Database connection pool initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize connection pool: {e}")
            raise
    
    def get_connection(self):
        """Get database connection from pool"""
        try:
            return self.connection_pool.getconn()
        except Exception as e:
            logger.error(f"Failed to get connection from pool: {e}")
            raise
    
    def return_connection(self, conn):
        """Return connection to pool"""
        try:
            self.connection_pool.putconn(conn)
        except Exception as e:
            logger.error(f"Failed to return connection to pool: {e}")
    
    def close_pool(self):
        """Close all connections in pool"""
        try:
            self.connection_pool.closeall()
            logger.info("Database connection pool closed")
        except Exception as e:
            logger.error(f"Error closing connection pool: {e}")
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        conn = None
        try:
            conn = self.get_connection()
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    "SELECT id, email, full_name, hashed_password, is_active, created_at FROM users WHERE email = %s",
                    (email,)
                )
                result = cursor.fetchone()
                return dict(result) if result else None
        except Exception as e:
            logger.error(f"Database error in get_user_by_email: {e}")
            return None
        finally:
            if conn:
                self.return_connection(conn)
    
    def create_user(self, email: str, full_name: str, hashed_password: str) -> Optional[Dict[str, Any]]:
        """Create a new user"""
        conn = None
        try:
            conn = self.get_connection()
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    "INSERT INTO users (email, full_name, hashed_password) VALUES (%s, %s, %s) RETURNING id, email, full_name, is_active, created_at",
                    (email, full_name, hashed_password)
                )
                result = cursor.fetchone()
                conn.commit()
                return dict(result) if result else None
        except Exception as e:
            logger.error(f"Database error in create_user: {e}")
            if conn:
                conn.rollback()
            return None
        finally:
            if conn:
                self.return_connection(conn)

# Global instance
db_service = DatabaseService()
