"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  BarChart3,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface ImplementationStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  estimatedDuration: string;
  dependencies?: string[];
  impact: "high" | "medium" | "low";
}

interface ImplementationPlan {
  id: string;
  title: string;
  description: string;
  status: "draft" | "approved" | "in_progress" | "completed" | "paused";
  steps: ImplementationStep[];
  estimatedCompletion: Date;
  expectedImpact: {
    metric: string;
    improvement: string;
    confidence: number;
  };
  monitoringMetrics: string[];
}

interface RecommendationImplementerProps {
  recommendation: string;
  onImplementationComplete?: (plan: ImplementationPlan) => void;
  onCancel?: () => void;
  className?: string;
}

export function RecommendationImplementer({
  recommendation,
  onImplementationComplete,
  onCancel,
  className,
}: RecommendationImplementerProps) {
  const [currentPlan, setCurrentPlan] = useState<ImplementationPlan | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImplementing, setIsImplementing] = useState(false);

  const generateImplementationPlan = async () => {
    setIsGenerating(true);

    // Simulate AI planning
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const plan: ImplementationPlan = {
      id: `plan-${Date.now()}`,
      title: `Implementation: ${recommendation}`,
      description: `AI-generated implementation plan for: ${recommendation}`,
      status: "draft",
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      expectedImpact: {
        metric: "Marketing Efficiency",
        improvement: "18-22% improvement",
        confidence: 0.85,
      },
      monitoringMetrics: [
        "ROI improvement",
        "Cost per acquisition",
        "Channel performance",
        "Cross-channel attribution",
      ],
      steps: generateImplementationSteps(recommendation),
    };

    setCurrentPlan(plan);
    setIsGenerating(false);
  };

  const startImplementation = async () => {
    if (!currentPlan) return;

    setIsImplementing(true);
    setCurrentPlan((prev) =>
      prev ? { ...prev, status: "in_progress" } : null
    );

    // Simulate step-by-step implementation
    for (let i = 0; i < currentPlan.steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setCurrentPlan((prev) => {
        if (!prev) return null;
        const updatedSteps = [...prev.steps];
        updatedSteps[i] = {
          ...updatedSteps[i],
          status: "in_progress",
          id: updatedSteps[i]?.id || `step-${i}`,
          title: updatedSteps[i]?.title || `Step ${i + 1}`,
          description:
            updatedSteps[i]?.description || `Implementing step ${i + 1}`,
          estimatedDuration: updatedSteps[i]?.estimatedDuration || "2-3 days",
          dependencies: updatedSteps[i]?.dependencies || [],
          impact: updatedSteps[i]?.impact || "medium",
        };
        return { ...prev, steps: updatedSteps };
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setCurrentPlan((prev) => {
        if (!prev) return null;
        const updatedSteps = [...prev.steps];
        updatedSteps[i] = {
          ...updatedSteps[i],
          status: "completed",
          id: updatedSteps[i]?.id || `step-${i}`,
          title: updatedSteps[i]?.title || `Step ${i + 1}`,
          description:
            updatedSteps[i]?.description || `Completed step ${i + 1}`,
          estimatedDuration: updatedSteps[i]?.estimatedDuration || "2-3 days",
          dependencies: updatedSteps[i]?.dependencies || [],
          impact: updatedSteps[i]?.impact || "medium",
        };
        return { ...prev, steps: updatedSteps };
      });
    }

    setCurrentPlan((prev) => (prev ? { ...prev, status: "completed" } : null));
    setIsImplementing(false);
    onImplementationComplete?.(currentPlan);
  };

  const pauseImplementation = () => {
    setCurrentPlan((prev) => (prev ? { ...prev, status: "paused" } : null));
    setIsImplementing(false);
  };

  const resetImplementation = () => {
    setCurrentPlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: "draft",
        steps: prev.steps.map((step) => ({
          ...step,
          status: "pending" as const,
        })),
      };
    });
    setIsImplementing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!currentPlan) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Implement Recommendation
          </CardTitle>
          <CardDescription>
            AI will create a detailed implementation plan for: "{recommendation}
            "
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">
              What will happen:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • AI will analyze the recommendation and create a step-by-step
                plan
              </li>
              <li>
                • Each step will include timelines, dependencies, and expected
                impact
              </li>
              <li>
                • You can review and modify the plan before implementation
              </li>
              <li>• Progress will be monitored with real-time updates</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateImplementationPlan}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Generate Implementation Plan
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allStepsCompleted = currentPlan.steps.every(
    (step) => step.status === "completed"
  );
  const isInProgress = currentPlan.status === "in_progress";

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {currentPlan.title}
            </CardTitle>
            <CardDescription>{currentPlan.description}</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "border",
              currentPlan.status === "completed" &&
                "bg-green-100 text-green-800 border-green-200",
              currentPlan.status === "in_progress" &&
                "bg-blue-100 text-blue-800 border-blue-200",
              currentPlan.status === "paused" &&
                "bg-yellow-100 text-yellow-800 border-yellow-200"
            )}
          >
            {currentPlan.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Implementation Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              Expected Impact
            </h4>
            <p className="text-2xl font-bold text-green-600">
              {currentPlan.expectedImpact.improvement}
            </p>
            <p className="text-sm text-gray-600">
              {currentPlan.expectedImpact.metric}
            </p>
            <p className="text-xs text-gray-500">
              Confidence:{" "}
              {Math.round(currentPlan.expectedImpact.confidence * 100)}%
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
            <p className="text-lg font-semibold text-blue-600">
              {currentPlan.estimatedCompletion.toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">Estimated completion</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Progress</h4>
            <p className="text-lg font-semibold text-purple-600">
              {currentPlan.steps.filter((s) => s.status === "completed").length}{" "}
              / {currentPlan.steps.length}
            </p>
            <p className="text-sm text-gray-600">Steps completed</p>
          </div>
        </div>

        {/* Implementation Steps */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">
            Implementation Steps
          </h4>
          <div className="space-y-3">
            {currentPlan.steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "p-4 rounded-lg border",
                  step.status === "completed" && "bg-green-50 border-green-200",
                  step.status === "in_progress" && "bg-blue-50 border-blue-200",
                  step.status === "failed" && "bg-red-50 border-red-200",
                  step.status === "pending" && "bg-gray-50 border-gray-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900">
                        {step.title}
                      </h5>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getStatusColor(step.status))}
                      >
                        {step.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {step.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {step.estimatedDuration}
                      </span>
                      {step.dependencies && step.dependencies.length > 0 && (
                        <span>
                          Dependencies: {step.dependencies.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monitoring Metrics */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Monitoring Metrics
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentPlan.monitoringMetrics.map((metric, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                {metric}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {currentPlan.status === "draft" && (
            <Button onClick={startImplementation} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start Implementation
            </Button>
          )}

          {isInProgress && (
            <>
              <Button variant="outline" onClick={pauseImplementation}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button onClick={startImplementation} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Continue
              </Button>
            </>
          )}

          {currentPlan.status === "paused" && (
            <Button onClick={startImplementation} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Resume Implementation
            </Button>
          )}

          {allStepsCompleted && (
            <Button className="flex-1" disabled>
              <CheckCircle className="h-4 w-4 mr-2" />
              Implementation Complete
            </Button>
          )}

          <Button variant="outline" onClick={resetImplementation}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>

          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to generate implementation steps based on recommendation
function generateImplementationSteps(
  recommendation: string
): ImplementationStep[] {
  const steps: ImplementationStep[] = [];

  if (recommendation.toLowerCase().includes("budget")) {
    steps.push(
      {
        id: "analyze-current",
        title: "Analyze Current Budget Allocation",
        description:
          "Review existing budget distribution across channels and identify optimization opportunities",
        status: "pending",
        estimatedDuration: "2-3 hours",
        impact: "high",
      },
      {
        id: "create-optimization",
        title: "Create Budget Optimization Model",
        description:
          "Develop AI-powered budget allocation model based on performance data",
        status: "pending",
        estimatedDuration: "4-6 hours",
        dependencies: ["analyze-current"],
        impact: "high",
      },
      {
        id: "implement-changes",
        title: "Implement Budget Changes",
        description:
          "Apply optimized budget allocation across marketing channels",
        status: "pending",
        estimatedDuration: "1-2 hours",
        dependencies: ["create-optimization"],
        impact: "high",
      },
      {
        id: "setup-monitoring",
        title: "Setup Performance Monitoring",
        description:
          "Configure real-time monitoring for budget optimization results",
        status: "pending",
        estimatedDuration: "2-3 hours",
        dependencies: ["implement-changes"],
        impact: "medium",
      }
    );
  } else if (recommendation.toLowerCase().includes("channel")) {
    steps.push(
      {
        id: "channel-analysis",
        title: "Analyze Channel Performance",
        description:
          "Deep dive into channel-specific performance metrics and efficiency",
        status: "pending",
        estimatedDuration: "3-4 hours",
        impact: "high",
      },
      {
        id: "optimize-targeting",
        title: "Optimize Channel Targeting",
        description:
          "Refine targeting parameters for improved channel efficiency",
        status: "pending",
        estimatedDuration: "2-3 hours",
        dependencies: ["channel-analysis"],
        impact: "high",
      },
      {
        id: "test-variations",
        title: "Test Channel Variations",
        description: "Implement A/B tests for channel optimization strategies",
        status: "pending",
        estimatedDuration: "1-2 weeks",
        dependencies: ["optimize-targeting"],
        impact: "medium",
      }
    );
  } else {
    // Generic implementation steps
    steps.push(
      {
        id: "analyze-requirements",
        title: "Analyze Implementation Requirements",
        description:
          "Break down the recommendation into specific actionable requirements",
        status: "pending",
        estimatedDuration: "1-2 hours",
        impact: "high",
      },
      {
        id: "create-action-plan",
        title: "Create Detailed Action Plan",
        description:
          "Develop step-by-step implementation plan with timelines and dependencies",
        status: "pending",
        estimatedDuration: "2-3 hours",
        dependencies: ["analyze-requirements"],
        impact: "high",
      },
      {
        id: "execute-implementation",
        title: "Execute Implementation",
        description: "Carry out the recommended changes with proper monitoring",
        status: "pending",
        estimatedDuration: "3-5 hours",
        dependencies: ["create-action-plan"],
        impact: "high",
      },
      {
        id: "validate-results",
        title: "Validate Implementation Results",
        description:
          "Monitor and validate the effectiveness of implemented changes",
        status: "pending",
        estimatedDuration: "1-2 weeks",
        dependencies: ["execute-implementation"],
        impact: "medium",
      }
    );
  }

  return steps;
}
