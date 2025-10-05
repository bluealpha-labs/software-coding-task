"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { toast } from "react-hot-toast";
// import { Badge } from "@workspace/ui/components/badge";
import {
  Brain,
  Send,
  User,
  Bot,
  Loader2,
  MessageSquare,
  X,
  Maximize2,
  Minimize2,
  Lightbulb,
  TrendingUp,
  // AlertTriangle,
  BarChart3,
  // Target,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { DashboardContext } from "../../hooks/useAIContext";

// Types for AI chat functionality
interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  context?: {
    chartType?: string;
    metric?: string;
    actionType?: "question" | "implementation_request" | "follow_up";
  };
}

interface AIResponse {
  message: string;
  suggestions?: string[];
  actions?: {
    type: "implement_recommendation" | "explain_chart" | "analyze_trend";
    data: any;
  }[];
  confidence: number;
}

interface AIChatInterfaceProps {
  dashboardContext?: DashboardContext;
  onImplementRecommendation?: (recommendation: string) => void;
  onExplainChart?: (chartType: string, data: any) => void;
  className?: string;
}

export function AIChatInterface({
  dashboardContext,
  onImplementRecommendation,
  onExplainChart,
  className,
}: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        type: "ai",
        content:
          "Hi! I'm your AI assistant for MMM analysis. I can help you understand your marketing data, explain visualizations, and implement recommendations. What would you like to know?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const aiResponse = await generateAIResponse(inputValue, dashboardContext);

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: aiResponse.message,
        timestamp: new Date(),
        context: {
          actionType: "question",
        },
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Failed to generate AI response");
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "ai",
        content:
          "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    handleSendMessage();
  };

  const handleImplementRecommendation = (recommendation: string) => {
    onImplementRecommendation?.(recommendation);
    const implementationMessage: ChatMessage = {
      id: `impl-${Date.now()}`,
      type: "ai",
      content: `I've initiated the implementation of: "${recommendation}". The system will now apply this recommendation to your marketing strategy.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, implementationMessage]);
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (isMinimized) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-12 h-12 p-0 shadow-lg"
          size="sm"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "w-full max-w-2xl mx-auto",
        isExpanded ? "h-[600px]" : "h-[400px]",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <CardDescription>Ask questions about your data</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col h-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "flex gap-3 max-w-[80%]",
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {message.type === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm",
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Bot className="h-4 w-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleQuickAction("Explain the contribution chart")
                }
                className="text-xs"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Explain Chart
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("What are the key trends?")}
                className="text-xs"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Key Trends
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("Give me recommendations")}
                className="text-xs"
              >
                <Lightbulb className="h-3 w-3 mr-1" />
                Recommendations
              </Button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about your data..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock AI response generation
async function generateAIResponse(
  userInput: string,
  context?: DashboardContext
): Promise<AIResponse> {
  // Simulate AI processing based on user input and context
  const input = userInput.toLowerCase();

  // Context-aware responses
  if (input.includes("explain") && input.includes("chart")) {
    return {
      message: `Based on your current dashboard view, I can see you're looking at the contribution analysis. The chart shows how different marketing channels contribute to your overall performance. 

Key insights from your data:
• **Top performing channel**: Digital Ads (35% contribution)
• **Emerging opportunity**: Social Media shows strong ROI potential
• **Optimization needed**: TV advertising appears to be in saturation

Would you like me to dive deeper into any specific channel or provide recommendations for optimization?`,
      suggestions: [
        "Show me the response curve for Digital Ads",
        "What's the optimal budget allocation?",
        "Implement the social media recommendation",
      ],
      confidence: 0.85,
    };
  }

  if (input.includes("trend") || input.includes("pattern")) {
    return {
      message: `I've analyzed your marketing data and identified several important trends:

📈 **Positive Trends:**
• Digital channel efficiency improving by 12% month-over-month
• Cross-channel synergy effects becoming more pronounced
• Customer acquisition cost decreasing across all touchpoints

⚠️ **Areas of Concern:**
• Traditional media showing diminishing returns
• Seasonal patterns affecting Q4 performance
• Attribution complexity increasing with new channels

**Recommendation**: Focus budget reallocation toward high-efficiency digital channels while maintaining brand awareness through optimized traditional media spend.`,
      suggestions: [
        "Show me the seasonal analysis",
        "Implement the budget reallocation",
        "What's the optimal media mix?",
      ],
      confidence: 0.92,
    };
  }

  if (input.includes("recommend") || input.includes("suggest")) {
    return {
      message: `Based on your current MMM analysis, here are my top recommendations:

🎯 **Immediate Actions (Next 30 days):**
1. **Increase Digital Ads budget by 25%** - ROI is 3.2x and showing strong efficiency
2. **Reduce TV spend by 15%** - approaching saturation point with diminishing returns
3. **Test Social Media expansion** - high potential based on response curves

📊 **Strategic Initiatives (Next 90 days):**
• Implement cross-channel attribution modeling
• Develop seasonal adjustment algorithms
• Create automated budget optimization rules

**Expected Impact**: 18-22% improvement in overall marketing efficiency

Would you like me to implement any of these recommendations or provide more detailed analysis?`,
      actions: [
        {
          type: "implement_recommendation",
          data: { recommendation: "Increase Digital Ads budget by 25%" },
        },
      ],
      confidence: 0.88,
    };
  }

  if (input.includes("implement") || input.includes("apply")) {
    return {
      message: `I can help you implement recommendations! Here's what I can do:

✅ **Available Implementation Actions:**
• Adjust budget allocations across channels
• Modify campaign parameters and targeting
• Set up automated optimization rules
• Create performance monitoring dashboards
• Generate implementation timelines

**Current Context**: I can see your dashboard shows contribution analysis. Which specific recommendation would you like me to implement?

I can also create a detailed implementation plan with timelines, success metrics, and monitoring protocols.`,
      suggestions: [
        "Implement the digital ads budget increase",
        "Create an optimization timeline",
        "Set up monitoring for the changes",
      ],
      confidence: 0.9,
    };
  }

  if (input.includes("help") || input.includes("what can you do")) {
    return {
      message: `I'm your AI assistant for Marketing Mix Modeling! Here's what I can help you with:

🔍 **Data Analysis:**
• Explain any chart or visualization
• Identify trends and patterns in your data
• Detect anomalies and outliers
• Provide statistical insights

💡 **Recommendations:**
• Generate data-driven marketing recommendations
• Suggest budget optimizations
• Identify growth opportunities
• Recommend testing strategies

⚡ **Implementation:**
• Implement recommended changes
• Create optimization plans
• Set up monitoring protocols
• Generate action timelines

Just ask me anything about your marketing data, and I'll provide context-aware insights!`,
      confidence: 0.95,
    };
  }

  // Default response
  return {
    message: `I understand you're asking about "${userInput}". Based on your current dashboard context, I can help you analyze your marketing data, explain visualizations, or provide recommendations.

Could you be more specific about what you'd like to know? For example:
• "Explain the contribution chart"
• "What are the key trends in my data?"
• "Give me recommendations for optimization"
• "Help me implement the social media strategy"

I'm here to help you get the most value from your MMM analysis!`,
    suggestions: [
      "Explain the current chart",
      "Show me key insights",
      "What should I optimize?",
    ],
    confidence: 0.75,
  };
}
