"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  BarChart3,
  Brain,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  MessageSquare,
  Target,
  Database,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { cn } from "@workspace/ui/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  activeSection,
  onSectionChange,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      description: "Dashboard overview",
    },
    {
      id: "ai-insights",
      label: "AI Insights",
      icon: Brain,
      description: "AI recommendations",
      badge: "New",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      description: "Channel analytics",
    },
    {
      id: "chat",
      label: "AI Chat",
      icon: MessageSquare,
      description: "Ask AI questions",
    },
    {
      id: "recommendations",
      label: "Actions",
      icon: Target,
      description: "Implement recommendations",
    },
    {
      id: "data",
      label: "Data Sources",
      icon: Database,
      description: "Data management",
    },
  ];

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">MMM Dashboard</h2>
              <p className="text-xs text-gray-500">Marketing Mix Modeling</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-2"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100",
                isActive && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
                isCollapsed && "justify-center p-2"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}
            </Button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900">
              {user?.full_name || user?.email}
            </p>
            <p className="text-xs text-gray-500">Signed in</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  );
}
