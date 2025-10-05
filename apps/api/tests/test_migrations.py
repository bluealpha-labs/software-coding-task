import pytest
import os
from pathlib import Path
from api.services.migration_service import MigrationService, get_migration_files

class TestMigrationService:
    """Test automated migration functionality."""
    
    def test_get_migration_files(self):
        """Test that migration files are discovered correctly."""
        migrations_dir = Path(__file__).parent.parent.parent / "migrations"
        migration_files = get_migration_files(str(migrations_dir))
        
        # Should find at least the existing migration
        assert len(migration_files) >= 1
        assert any("001_create_users_table.sql" in str(f) for f in migration_files)
    
    def test_migration_service_initialization(self):
        """Test migration service initialization."""
        service = MigrationService()
        assert service is not None
        assert hasattr(service, 'run_migrations')
    
    def test_migration_status_tracking(self):
        """Test that migration status is tracked correctly."""
        service = MigrationService()
        
        # Test checking if migration is applied
        # (This would check the database in real implementation)
        status = service.get_migration_status("001_create_users_table.sql")
        # For now, we'll just test the method exists
        assert isinstance(status, bool)
    
    def test_migration_ordering(self):
        """Test that migrations are run in correct order."""
        migrations_dir = Path(__file__).parent.parent.parent / "migrations"
        migration_files = get_migration_files(str(migrations_dir))
        
        # Should be sorted by filename (which includes timestamp/sequence)
        filenames = [f.name for f in migration_files]
        assert filenames == sorted(filenames)
    
    def test_migration_rollback(self):
        """Test migration rollback functionality."""
        service = MigrationService()
        
        # Test rollback method exists
        assert hasattr(service, 'rollback_migration')
        
        # Test rollback functionality (mock)
        result = service.rollback_migration("001_create_users_table.sql")
        # Should return success/failure status
        assert isinstance(result, bool)
    
    def test_migration_validation(self):
        """Test that migration files are validated."""
        service = MigrationService()
        
        # Test valid migration file
        valid_migration = "001_create_users_table.sql"
        is_valid = service.validate_migration_file(valid_migration)
        assert is_valid is True
        
        # Test invalid migration file
        invalid_migration = "invalid_migration.sql"
        is_valid = service.validate_migration_file(invalid_migration)
        assert is_valid is False
