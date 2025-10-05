"use client";

import { useAuth } from "../../lib/auth";
import { UserRole } from "../../lib/auth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const userRole = user.role as UserRole;
  const hasPermission = allowedRoles.includes(userRole);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

interface UserOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function UserOnly({ children, fallback = null }: UserOnlyProps) {
  return (
    <RoleGuard
      allowedRoles={[UserRole.USER, UserRole.ADMIN]}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}
