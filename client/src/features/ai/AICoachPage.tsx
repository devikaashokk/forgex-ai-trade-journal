// client/src/features/ai/AICoachPage.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  Shield,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { AIAnalysis } from "@/types";
import { getAIAnalysis } from "./ai.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { getApiError, cn } from "@/lib/utils";

function DisciplineScore({ score }: { score: number }) {
  const color =
    score >= 75 ? "#00D4AA" : score >= 50 ? "#F59E0B" : "#EF4444";
  const label =
    score >= 75 ? "Strong" : score >= 50 ? "Developing" : "Needs Work";

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative flex items-center justify-center">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
            transform="rotate(-90 60 60)"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-3xl font-display font-bold" style={{ color }}>
            {score}
          </p>
          <p className="text-xs text-muted-foreground">/ 100</p>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold" style={{ color }}>
        {label} Discipline
      </p>
    </div>
  );
}

function AnalysisSection({
  icon: Icon,
  title,
  items,
  variant,
  delay,
}: {
  icon: typeof Brain;
  title: string;
  items: string[];
  variant: "default" | "warning" | "success" | "info";
  delay: number;
}) {
  const styles = {
    default: { border: "border-border", icon: "text-muted-foreground", badge: "secondary" as const },
    warning: { border: "border-red-500/20", icon: "text-red-500", badge: "destructive" as const },
    success: { border: "border-forge-500/20", icon: "text-forge-500", badge: "success" as const },
    info: { border: "border-blue-500/20", icon: "text-blue-500", badge: "secondary" as const },
  };
  const s = styles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={cn("border", s.border)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className={cn("h-4 w-4", s.icon)} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <ChevronRight className={cn("h-4 w-4 mt-0.5 flex-shrink-0", s.icon)} />
              <p className="text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AICoachPage() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const data = await getAIAnalysis();
      setAnalysis(data);
      setRan(true);
    } catch (err) {
      const msg = getApiError(err);
      toast({
        title: "Analysis failed",
        description: msg.includes("3 trades")
          ? "You need at least 3 trades to get AI analysis."
          : msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Coach
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Powered by Groq AI — analyzes your journal for psychological patterns          </p>
        </div>
        {ran && (
          <Button variant="outline" size="sm" onClick={runAnalysis} loading={loading}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Re-analyze
          </Button>
        )}
      </div>

      {/* CTA — before first analysis */}
      {!ran && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-10 flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl mb-2">
                  Get your AI trading analysis
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  AI will analyze your trade journal to detect emotional patterns,
                  calculate your discipline score, and give you personalized improvement advice.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                {[
                  "Emotional pattern detection",
                  "Discipline scoring",
                  "Revenge trading alerts",
                  "Personalized suggestions",
                ].map((f) => (
                  <Badge key={f} variant="outline" className="text-xs">
                    {f}
                  </Badge>
                ))}
              </div>
              <Button onClick={runAnalysis} loading={loading} size="lg" className="mt-2">
                <Brain className="h-4 w-4 mr-2" />
                Analyze My Journal
              </Button>
              <p className="text-xs text-muted-foreground">
                Requires at least 3 logged trades
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
                <Brain className="h-7 w-7 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">  AI is analyzing your journal…</p>
              <p className="text-xs text-muted-foreground mt-1">
                Scanning emotional patterns and trade behavior
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {analysis && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Overall feedback + discipline score */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0 }}
                className="sm:col-span-1"
              >
                <Card className="h-full flex flex-col items-center justify-center">
                  <DisciplineScore
                    score={
                      analysis.disciplineScore <= 1
                        ? Math.round(analysis.disciplineScore * 100)
                        : Math.round(analysis.disciplineScore)
                    }
                  />                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="sm:col-span-2"
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Overall Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-foreground">
                      {analysis.overallFeedback}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {analysis.emotionalPatterns.map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs font-normal">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Risk warnings */}
            {analysis.riskWarnings.length > 0 && (
              <AnalysisSection
                icon={AlertTriangle}
                title="Risk Warnings"
                items={analysis.riskWarnings}
                variant="warning"
                delay={0.2}
              />
            )}

            {/* Suggestions */}
            <AnalysisSection
              icon={Lightbulb}
              title="Improvement Suggestions"
              items={analysis.suggestions}
              variant="info"
              delay={0.3}
            />

            {/* Emotional patterns detail */}
            <AnalysisSection
              icon={Shield}
              title="Emotional Patterns Detected"
              items={analysis.emotionalPatterns}
              variant="default"
              delay={0.4}
            />

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center pt-2">
              AI analysis is for educational purposes. Always use proper risk management.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
