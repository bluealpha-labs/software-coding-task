import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path
from api.config import get_settings

class AuditService:
    """Service for audit logging."""
    
    def __init__(self):
        self.settings = get_settings()
        self.audit_logger = logging.getLogger("audit")
        self.setup_audit_logging()
    
    def setup_audit_logging(self):
        """Setup audit logging configuration."""
        # Create audit logs directory
        audit_dir = Path(__file__).parent.parent / "logs" / "audit"
        audit_dir.mkdir(parents=True, exist_ok=True)
        
        # Create audit file handler
        audit_handler = logging.FileHandler(audit_dir / "audit.log")
        audit_handler.setLevel(logging.INFO)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        )
        audit_handler.setFormatter(formatter)
        
        # Add handler to audit logger
        self.audit_logger.addHandler(audit_handler)
        self.audit_logger.setLevel(logging.INFO)
    
    def log_event(
        self,
        event_type: str,
        user_id: Optional[int] = None,
        user_email: Optional[str] = None,
        resource: Optional[str] = None,
        action: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log an audit event."""
        audit_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "user_id": user_id,
            "user_email": user_email,
            "resource": resource,
            "action": action,
            "details": details or {},
            "ip_address": ip_address,
            "user_agent": user_agent
        }
        
        # Log to file
        self.audit_logger.info(json.dumps(audit_data))
        
        # Also log to console in development
        if self.settings.DEBUG:
            print(f"AUDIT: {json.dumps(audit_data, indent=2)}")
    
    def log_auth_event(
        self,
        event_type: str,
        user_email: str,
        success: bool,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log authentication events."""
        self.log_event(
            event_type=event_type,
            user_email=user_email,
            resource="authentication",
            action="login" if "login" in event_type else "logout",
            details={"success": success},
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    def log_data_access(
        self,
        user_id: int,
        user_email: str,
        resource: str,
        action: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log data access events."""
        self.log_event(
            event_type="data_access",
            user_id=user_id,
            user_email=user_email,
            resource=resource,
            action=action,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    def log_admin_action(
        self,
        admin_user_id: int,
        admin_email: str,
        action: str,
        target_user_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log admin actions."""
        self.log_event(
            event_type="admin_action",
            user_id=admin_user_id,
            user_email=admin_email,
            resource="admin",
            action=action,
            details={
                "target_user_id": target_user_id,
                **(details or {})
            },
            ip_address=ip_address,
            user_agent=user_agent
        )

# Global audit service
audit_service = AuditService()
