// client/src/features/dashboard/DashboardPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Zap,
  Trophy,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { DashboardStats, Trade } from "@/types";
import { getDashboardStats } from "./dashboard.api";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { EquityCurve } from "@/components/charts/EquityCurve";
import { EmotionChart } from "@/components/charts/EmotionChart";
import { formatCurrency, formatDate, getPnlColor, getEmotionLabel } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

function RecentTradeRow({ trade }: { trade: Trade }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
    >
      <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${trade.isWin ? "bg-forge-500" : "bg-red-500"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium font-mono">{trade.pair}</span>
          <Badge variant={trade.direction === "LONG" ? "success" : "destructive"} className="text-[10px] px-1.5 py-0">
            {trade.direction}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{formatDate(trade.closedAt)}</p>
      </div>
      <div className="text-right">
        <p
          className="text-sm font-semibold number-mono"
          style={{ color: getPnlColor(trade.pnl) }}
        >
          {formatCurrency(trade.pnl)}
        </p>
        <p className="text-xs text-muted-foreground">{getEmotionLabel(trade.emotion)}</p>
      </div>
    </motion.div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        toast({ title: "Failed to load dashboard", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Your trading performance overview</p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (!stats || stats.totalTrades === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Your trading performance overview</p>
        </div>
        <EmptyState
          icon={BarChart3}
          title="No trades yet"
          description="Log your first trade to see your analytics, equity curve, and AI-powered insights here."
          action={{ label: "Log First Trade", onClick: () => navigate("/trades/new") }}
        />
      </div>
    );
  }

  const pnlTrend = stats.totalPnl >= 0 ? "up" : "down";
  const winRateTrend = stats.winRate >= 50 ? "up" : "down";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.totalTrades} trades logged
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/trades/new")}>
          <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
          Log Trade
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total P&L"
          value={formatCurrency(stats.totalPnl)}
          icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
          trend={pnlTrend}
          delay={0}
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate}%`}
          icon={Target}
          trend={winRateTrend}
          subtext={`${stats.totalTrades} total trades`}
          delay={0.05}
        />
        <StatCard
          label="Avg R:R"
          value={`${stats.avgRR}R`}
          icon={BarChart3}
          trend="neutral"
          delay={0.1}
        />
        <StatCard
          label="Best Trade"
          value={formatCurrency(stats.bestTrade)}
          icon={Trophy}
          trend="up"
          subtext={`Worst: ${formatCurrency(stats.worstTrade)}`}
          delay={0.15}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Win Streak"
          value={`${stats.longestWinStreak}`}
          icon={Zap}
          trend="neutral"
          subtext="Longest consecutive wins"
          delay={0.2}
        />
        <StatCard
          label="Loss Streak"
          value={`${stats.longestLoseStreak}`}
          icon={AlertTriangle}
          trend="neutral"
          subtext="Longest consecutive losses"
          delay={0.25}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Equity curve */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Equity Curve</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.equityCurve.length > 1 ? (
                <EquityCurve data={stats.equityCurve} />
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                  Need more trades to show equity curve
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Emotion breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Emotion Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.emotionBreakdown).length > 0 ? (
                <EmotionChart data={stats.emotionBreakdown} />
              ) : (
                <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                  No emotion data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent trades */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Trades</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/trades")} className="h-7 text-xs gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.recentTrades.length > 0 ? (
              <div>
                {stats.recentTrades.slice(0, 8).map((trade) => (
                  <RecentTradeRow key={trade.id} trade={trade} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No recent trades
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
