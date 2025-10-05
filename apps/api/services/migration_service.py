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
        """Rollback a migration with enhanced error handling."""
        try:
            # Check if migration exists
            if not self.get_migration_status(migration_name):
                logger.warning(f"Migration {migration_name} not found or not applied")
                return False
            
            # Get rollback SQL from migration file
            migration_path = self.migrations_dir / migration_name
            if not migration_path.exists():
                logger.error(f"Migration file {migration_name} not found")
                return False
            
            # Read rollback SQL (look for -- ROLLBACK section)
            with open(migration_path, 'r') as f:
                content = f.read()
            
            # Extract rollback SQL
            rollback_sql = self._extract_rollback_sql(content)
            
            if not rollback_sql:
                logger.warning(f"No rollback SQL found for {migration_name}")
                # Still remove the migration record
                with db_service.get_connection() as conn:
                    with conn.cursor() as cursor:
                        cursor.execute(
                            "DELETE FROM migrations WHERE name = %s",
                            (migration_name,)
                        )
                        conn.commit()
                return True
            
            # Execute rollback SQL
            with db_service.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(rollback_sql)
                    # Remove migration record
                    cursor.execute(
                        "DELETE FROM migrations WHERE name = %s",
                        (migration_name,)
                    )
                    conn.commit()
            
            logger.info(f"Successfully rolled back migration {migration_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error rolling back migration {migration_name}: {e}")
            return False
    
    def _extract_rollback_sql(self, content: str) -> str:
        """Extract rollback SQL from migration content."""
        lines = content.split('\n')
        rollback_lines = []
        in_rollback_section = False
        
        for line in lines:
            line = line.strip()
            if line.startswith('-- ROLLBACK') or line.startswith('--ROLLBACK'):
                in_rollback_section = True
                continue
            elif line.startswith('--') and in_rollback_section:
                continue
            elif in_rollback_section:
                if line and not line.startswith('--'):
                    rollback_lines.append(line)
        
        return '\n'.join(rollback_lines).strip()
    
    def get_migration_history(self) -> List[Dict[str, Any]]:
        """Get migration history with details."""
        try:
            with db_service.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT name, applied_at, created_at 
                        FROM migrations 
                        ORDER BY applied_at DESC
                    """)
                    results = cursor.fetchall()
                    
                    return [
                        {
                            "name": row[0],
                            "applied_at": row[1],
                            "created_at": row[2]
                        }
                        for row in results
                    ]
        except Exception as e:
            logger.error(f"Error getting migration history: {e}")
            return []
    
    def validate_migration_integrity(self) -> Dict[str, Any]:
        """Validate migration integrity and consistency."""
        results = {
            "valid": True,
            "issues": [],
            "warnings": []
        }
        
        try:
            # Check if migrations table exists
            with db_service.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_name = 'migrations'
                        );
                    """)
                    table_exists = cursor.fetchone()[0]
                    
                    if not table_exists:
                        results["valid"] = False
                        results["issues"].append("Migrations table does not exist")
                        return results
            
            # Check for orphaned migration files
            migration_files = self.get_migration_files()
            applied_migrations = self.get_migration_history()
            applied_names = {m["name"] for m in applied_migrations}
            
            for migration_file in migration_files:
                if migration_file.name not in applied_names:
                    results["warnings"].append(f"Migration file {migration_file.name} exists but not applied")
            
            # Check for missing migration files
            for applied_migration in applied_migrations:
                migration_path = self.migrations_dir / applied_migration["name"]
                if not migration_path.exists():
                    results["issues"].append(f"Applied migration {applied_migration['name']} file not found")
                    results["valid"] = False
            
        except Exception as e:
            results["valid"] = False
            results["issues"].append(f"Error validating migrations: {e}")
        
        return results
    
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
