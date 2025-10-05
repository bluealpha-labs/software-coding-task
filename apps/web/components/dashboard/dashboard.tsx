"use client";

import { useState } from "react";
import { Sidebar } from "../layout/sidebar";
import { ContributionChart } from "../charts/contribution-chart";
import { ResponseCurvesChart } from "../charts/response-curves-chart";
import { AIInsightsCompact } from "../ai/ai-insights-compact";
import { AIExplanationPanel } from "../ai/ai-explanation-panel";
import { DataSourceIndicator } from "../data-source-indicator";
import { AIChatInterface } from "../ai/ai-chat-interface";
import { RecommendationImplementer } from "../ai/recommendation-implementer";
import { useAuth } from "../../lib/auth";
import { useAIContext } from "../../hooks/useAIContext";
import { AIExplainRequest } from "../../lib/mmm-api";
import {
  BarChart3,
  Brain,
  TrendingUp,
  MessageSquare,
  Target,
  Database,
} from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();
  const { context, addInteraction } = useAIContext();
  const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [explainRequest, setExplainRequest] = useState<AIExplainRequest | null>(null);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showImplementer, setShowImplementer] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>("");

  const handleExplainRequest = (request: AIExplainRequest) => {
    setExplainRequest(request);
    setIsExplanationOpen(true);
  };

  const handleCloseExplanation = () => {
    setIsExplanationOpen(false);
    setExplainRequest(null);
  };

  const handleImplementRecommendation = (recommendation: string) => {
    setSelectedRecommendation(recommendation);
    setShowImplementer(true);
    setShowChat(false);
    setActiveSection("recommendations");
  };

  const handleChatToggle = () => {
    setShowChat(!showChat);
    setShowImplementer(false);
    setActiveSection("chat");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Spend</p>
                    <p className="text-2xl font-bold text-gray-900">$125K</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">ROI</p>
                    <p className="text-2xl font-bold text-gray-900">-3.2%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Top Channel</p>
                    <p className="text-2xl font-bold text-gray-900">TV</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Database className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Channels</p>
                    <p className="text-2xl font-bold text-gray-900">6</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContributionChart onExplainRequest={handleExplainRequest} />
              <ResponseCurvesChart onExplainRequest={handleExplainRequest} />
            </div>
          </div>
        );

      case "ai-insights":
        return <AIInsightsCompact />;

      case "analytics":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContributionChart onExplainRequest={handleExplainRequest} />
              <ResponseCurvesChart onExplainRequest={handleExplainRequest} />
            </div>
          </div>
        );

      case "chat":
        return (
          <AIChatInterface
            dashboardContext={{
              currentView: "insights" as const,
              selectedChart: "ai-chat",
              dataSnapshot: context.dataSnapshot,
              userInteractions: context.userInteractions,
            }}
            onImplementRecommendation={handleImplementRecommendation}
            onExplainChart={(chartType, data) => {
              addInteraction({
                type: "chart_click",
                data: { action: "explain_chart", chartType, data },
                context: "AI Chat Interface",
              });
            }}
          />
        );

      case "recommendations":
        return showImplementer && selectedRecommendation ? (
          <RecommendationImplementer
            recommendation={selectedRecommendation}
            onImplementationComplete={(plan) => {
              // Implementation completed
              setShowImplementer(false);
              setSelectedRecommendation("");
            }}
            onCancel={() => {
              setShowImplementer(false);
              setSelectedRecommendation("");
            }}
          />
        ) : (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Recommendations</h3>
            <p className="text-gray-600 mb-4">
              Select a recommendation from AI Insights to implement it.
            </p>
            <button
              onClick={() => setActiveSection("ai-insights")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View AI Insights →
            </button>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Data Sources</h3>
              <DataSourceIndicator />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to MMM Dashboard</h3>
            <p className="text-gray-600">Select a section from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeSection === "overview" && "Dashboard Overview"}
                {activeSection === "ai-insights" && "AI Insights"}
                {activeSection === "analytics" && "Analytics"}
                {activeSection === "chat" && "AI Chat"}
                {activeSection === "recommendations" && "Recommendations"}
                {activeSection === "data" && "Data Sources"}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {user?.full_name || user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <DataSourceIndicator />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* AI Explanation Panel */}
      <AIExplanationPanel
        isOpen={isExplanationOpen}
        onClose={handleCloseExplanation}
        explainRequest={explainRequest}
      />
    </div>
  );
}
