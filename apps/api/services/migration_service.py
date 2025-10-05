import os
import psycopg2
from pathlib import Path
from typing import List, Dict, Any
from api.config import get_settings
from api.services.database_service import db_service
from api.logging_config import get_logger

logger = get_logger(__name__)

class MigrationService:
    """Service for handling database migrations."""
    
    def __init__(self):
        self.settings = get_settings()
        self.migrations_dir = Path(__file__).parent.parent.parent / "migrations"
    
    def get_migration_files(self) -> List[Path]:
        """Get list of migration files in order."""
        if not self.migrations_dir.exists():
            return []
        
        migration_files = []
        for file_path in self.migrations_dir.glob("*.sql"):
            migration_files.append(file_path)
        
        # Sort by filename (which should include sequence numbers)
        return sorted(migration_files)
    
    def get_migration_status(self, migration_name: str) -> bool:
        """Check if migration has been applied."""
        try:
            with db_service.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Check if migrations table exists
                    cursor.execute("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_name = 'migrations'
                        );
                    """)
                    table_exists = cursor.fetchone()[0]
                    
                    if not table_exists:
                        return False
                    
                    # Check if migration is recorded
                    cursor.execute(
                        "SELECT COUNT(*) FROM migrations WHERE name = %s",
                        (migration_name,)
                    )
                    count = cursor.fetchone()[0]
                    return count > 0
        except Exception:
            return False
    
    def create_migrations_table(self) -> bool:
        """Create migrations tracking table."""
        try:
            with db_service.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS migrations (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(255) UNIQUE NOT NULL,
                            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    """)
                    conn.commit()
                    return True
        except Exception as e:
            print(f"Error creating migrations table: {e}")
            return False
    
    def record_migration(self, migration_name: str) -> bool:
        """Record that a migration has been applied."""
        try:
            with db_service.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(
                        "INSERT INTO migrations (name) VALUES (%s) ON CONFLICT (name) DO NOTHING",
                        (migration_name,)
                    )
                    conn.commit()
                    return True
        except Exception as e:
            print(f"Error recording migration: {e}")
            return False
    
    def validate_migration_file(self, migration_name: str) -> bool:
        """Validate that a migration file exists and is readable."""
        migration_path = self.migrations_dir / migration_name
        return migration_path.exists() and migration_path.is_file()
    
    def run_migration(self, migration_path: Path) -> bool:
        """Run a single migration file."""
        try:
            with open(migration_path, 'r') as f:
                migration_sql = f.read()
            
            with db_service.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(migration_sql)
                    conn.commit()
            
            # Record the migration
            self.record_migration(migration_path.name)
            return True
        except Exception as e:
            logger.error(f"Error running migration {migration_path.name}: {e}")
            return False
    
    def rollback_migration(self, migration_name: str) -> bool:
        """Rollback a migration (basic implementation)."""
        try:
            # In a real implementation, this would run rollback SQL
            # For now, we'll just remove the migration record
            with db_service.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(
                        "DELETE FROM migrations WHERE name = %s",
                        (migration_name,)
                    )
                    conn.commit()
            return True
        except Exception as e:
            logger.error(f"Error rolling back migration {migration_name}: {e}")
            return False
    
    def run_migrations(self) -> Dict[str, Any]:
        """Run all pending migrations."""
        results = {
            "applied": [],
            "skipped": [],
            "errors": []
        }
        
        # Ensure migrations table exists
        if not self.create_migrations_table():
            results["errors"].append("Failed to create migrations table")
            return results
        
        migration_files = self.get_migration_files()
        
        for migration_file in migration_files:
            migration_name = migration_file.name
            
            # Check if already applied
            if self.get_migration_status(migration_name):
                results["skipped"].append(migration_name)
                continue
            
            # Run the migration
            if self.run_migration(migration_file):
                results["applied"].append(migration_name)
            else:
                results["errors"].append(migration_name)
        
        return results

# Global migration service instance
migration_service = MigrationService()

def get_migration_files(migrations_dir: str) -> List[Path]:
    """Get migration files from directory."""
    service = MigrationService()
    service.migrations_dir = Path(migrations_dir)
    return service.get_migration_files()
