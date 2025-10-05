import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from typing import Optional, Dict, Any
import logging
from api.config import get_settings
from api.constants import DB_POOL_MIN_CONNECTIONS, DB_POOL_MAX_CONNECTIONS

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        settings = get_settings()
        self.conn_params = {
            'host': settings.POSTGRES_HOST,
            'port': int(settings.POSTGRES_PORT),
            'database': settings.POSTGRES_DB,
            'user': settings.POSTGRES_USER,
            'password': settings.POSTGRES_PASSWORD
        }
        
        # Initialize connection pool
        try:
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
            conn = self.connection_pool.getconn()
            # Test connection health with comprehensive checks
            with conn.cursor() as cursor:
                # Basic connectivity test
                cursor.execute("SELECT 1")
                
                # Check database version and status
                cursor.execute("SELECT version()")
                version = cursor.fetchone()[0]
                logger.debug(f"Database version: {version}")
                
                # Check if database is accepting connections
                cursor.execute("SELECT pg_is_in_recovery()")
                is_recovery = cursor.fetchone()[0]
                if is_recovery:
                    logger.warning("Database is in recovery mode")
                
                # Check active connections
                cursor.execute("""
                    SELECT count(*) as active_connections 
                    FROM pg_stat_activity 
                    WHERE state = 'active'
                """)
                active_connections = cursor.fetchone()[0]
                logger.debug(f"Active database connections: {active_connections}")
                
            return conn
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
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get comprehensive database health status"""
        health_status = {
            "status": "healthy",
            "pool_size": 0,
            "active_connections": 0,
            "database_version": None,
            "is_recovery": False,
            "errors": []
        }
        
        try:
            # Get pool information (psycopg2 doesn't expose used connections directly)
            # We'll use a different approach to check pool health
            health_status["pool_size"] = "unknown"  # psycopg2 doesn't expose this
            
            # Test connection and get database info
            conn = self.get_connection()
            try:
                with conn.cursor() as cursor:
                    # Get database version
                    cursor.execute("SELECT version()")
                    health_status["database_version"] = cursor.fetchone()[0]
                    
                    # Check if in recovery mode
                    cursor.execute("SELECT pg_is_in_recovery()")
                    health_status["is_recovery"] = cursor.fetchone()[0]
                    
                    # Get active connections
                    cursor.execute("""
                        SELECT count(*) as active_connections 
                        FROM pg_stat_activity 
                        WHERE state = 'active'
                    """)
                    health_status["active_connections"] = cursor.fetchone()[0]
                    
            finally:
                self.return_connection(conn)
                
        except Exception as e:
            health_status["status"] = "unhealthy"
            health_status["errors"].append(str(e))
            logger.error(f"Database health check failed: {e}")
        
        return health_status
    
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
