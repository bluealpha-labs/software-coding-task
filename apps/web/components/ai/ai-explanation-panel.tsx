"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { X, Brain, TrendingUp, AlertTriangle } from "lucide-react";
import {
  AIExplainResponse,
  AIExplainRequest,
  mmmApi,
  getCachedExplanation,
  setCachedExplanation,
} from "../../lib/mmm-api";
import { toast } from "react-hot-toast";

interface AIExplanationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  explainRequest: AIExplainRequest | null;
}

export function AIExplanationPanel({
  isOpen,
  onClose,
  explainRequest,
}: AIExplanationPanelProps) {
  const [explanation, setExplanation] = useState<AIExplainResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && explainRequest) {
      fetchExplanation(explainRequest);
    }
  }, [isOpen, explainRequest]);

  const fetchExplanation = async (request: AIExplainRequest) => {
    try {
      setLoading(true);

      // Check cache first
      const cached = getCachedExplanation(request);
      if (cached) {
        setExplanation(cached);
        return;
      }

      // Get AI explanation
      const response = await mmmApi.getAIExplanation(request);
      setExplanation(response.data);
      setCachedExplanation(request, response.data);
    } catch (error) {
      console.error("Error getting AI explanation:", error);
      toast.error("Failed to get AI explanation");
    } finally {
      setLoading(false);
    }
  };

  const handleDrillDown = (drilldown: string) => {
    // In a real implementation, this would trigger specific actions
    console.log("Drill down requested:", drilldown);
    toast.success(`Analyzing: ${drilldown}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>
                  Intelligent insights for your {explainRequest?.chart_type}{" "}
                  chart
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Analyzing data...</span>
              </div>
            ) : explanation ? (
              <>
                {/* Summary */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                    Summary
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {explanation.summary}
                  </p>
                </div>

                {/* Drill-downs */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Suggested Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {explanation.drilldowns.map((drilldown, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleDrillDown(drilldown)}
                        className="text-xs"
                      >
                        {drilldown}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Caveat */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                    Important Note
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                    {explanation.caveat}
                  </p>
                </div>

                {/* Confidence Score */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Confidence Score:
                    </span>
                    <Badge
                      variant={
                        explanation.confidence_score > 0.7
                          ? "default"
                          : "secondary"
                      }
                      className={
                        explanation.confidence_score > 0.7
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }
                    >
                      {(explanation.confidence_score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Generated:{" "}
                    {new Date(explanation.generated_at).toLocaleTimeString()}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No explanation available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
