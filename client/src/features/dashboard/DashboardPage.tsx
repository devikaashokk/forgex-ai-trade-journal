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
  Wallet,
  IndianRupee,
  Activity,
  CalendarDays,
  SlidersHorizontal,
} from "lucide-react";
import { DashboardStats, Trade } from "@/types";
import { getDashboardStats } from "./dashboard.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { EquityCurve } from "@/components/charts/EquityCurve";
import { EmotionChart } from "@/components/charts/EmotionChart";
import {
  formatCurrency,
  formatDate,
  getPnlColor,
  getEmotionLabel,
} from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

function ShellCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#101719]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_45px_rgba(0,0,0,0.35)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,91,36,0.10),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_35%)]" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  delay = 0,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#12191b] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-orange-500/40 sm:p-5"
    >
      <div className="absolute right-0 top-0 h-8 w-8 rounded-bl-2xl border-b border-l border-orange-500/40 bg-orange-500/10 opacity-0 transition group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            {label}
          </p>
          <p
            className={`mt-3 truncate font-mono text-2xl font-bold sm:text-3xl ${isPositive
                ? "text-[#50d13f]"
                : isNegative
                  ? "text-red-400"
                  : "text-zinc-100"
              }`}
          >
            {value}
          </p>
          {subtext && (
            <p className="mt-1 truncate text-xs text-zinc-400 sm:text-sm">
              {subtext}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/25 text-orange-500">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function RecentTradeRow({ trade }: { trade: Trade }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="grid grid-cols-[44px_1fr_auto] items-center gap-3 border-b border-white/10 py-3 last:border-0"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/25 text-center text-xs font-semibold uppercase text-zinc-400">
        {formatDate(trade.closedAt).slice(0, 6)}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-sm font-semibold text-zinc-100">
            {trade.pair}
          </span>
          <Badge
            variant={trade.direction === "LONG" ? "success" : "destructive"}
            className="px-1.5 py-0 text-[10px]"
          >
            {trade.direction}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          {getEmotionLabel(trade.emotion)}
        </p>
      </div>

      <div className="text-right">
        <p
          className="font-mono text-sm font-bold"
          style={{ color: getPnlColor(trade.pnl) }}
        >
          {formatCurrency(trade.pnl)}
        </p>
        <p className="text-[11px] text-zinc-500">
          {trade.isWin ? "WIN" : "LOSS"}
        </p>
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
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your trading performance overview
          </p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (!stats || stats.totalTrades === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your trading performance overview
          </p>
        </div>
        <EmptyState
          icon={BarChart3}
          title="No trades yet"
          description="Log your first trade to see your analytics, equity curve, and AI-powered insights here."
          action={{
            label: "Log First Trade",
            onClick: () => navigate("/trades/new"),
          }}
        />
      </div>
    );
  }

  const pnlTrend = stats.totalPnl >= 0 ? "up" : "down";
  const winRateTrend = stats.winRate >= 50 ? "up" : "down";
  const balanceTrend =
    stats.currentBalance >= stats.initialBalance ? "up" : "down";

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: stats.currency || "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="-m-4 min-h-screen bg-[#070b0d] p-4 text-zinc-100 sm:-m-6 sm:p-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        {/* Header */}
        <ShellCard>
          <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
                <Activity className="h-4 w-4" />
                ForgeX Control Room
              </div>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                {stats.totalTrades} trades logged · performance overview
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-zinc-300">
                <CalendarDays className="h-4 w-4 text-zinc-500" />
                Today
              </div>

              <Button
                size="sm"
                onClick={() => navigate("/trades/new")}
                className="h-11 rounded-xl bg-orange-600 px-5 font-semibold text-white hover:bg-orange-500"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Log Trade
              </Button>
            </div>
          </div>

          {/* Main stats */}
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-5">
            <MetricCard
              label="Current Balance"
              value={formatMoney(stats.currentBalance)}
              icon={Wallet}
              trend={balanceTrend}
              subtext={`Started: ${formatMoney(stats.initialBalance)}`}
              delay={0}
            />
            <MetricCard
              label="Total P&L"
              value={formatMoney(stats.totalPnl)}
              icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
              trend={pnlTrend}
              subtext={`${stats.growthPercent}% growth`}
              delay={0.05}
            />
            <MetricCard
              label="Win Rate"
              value={`${stats.winRate}%`}
              icon={Target}
              trend={winRateTrend}
              subtext={`${stats.totalTrades} total trades`}
              delay={0.1}
            />
            <MetricCard
              label="Best Trade"
              value={formatMoney(stats.bestTrade)}
              icon={Trophy}
              trend="up"
              subtext={`Worst: ${formatMoney(stats.worstTrade)}`}
              delay={0.15}
            />
            <MetricCard
              label="Avg R:R"
              value={`${stats.avgRR}R`}
              icon={BarChart3}
              trend="neutral"
              subtext="Average R:R"
              delay={0.2}
            />
          </div>
        </ShellCard>

        {/* Charts + summary */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <ShellCard className="xl:col-span-2">
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base uppercase tracking-wide text-zinc-100">
                  Performance Over Time
                </CardTitle>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-white/10 bg-black/20 text-xs text-zinc-300 hover:bg-white/5"
                >
                  Equity
                  <SlidersHorizontal className="ml-2 h-3.5 w-3.5" />
                </Button>
              </CardHeader>

              <CardContent>
                {stats.equityCurve.length > 1 ? (
                  <div className="h-[280px] sm:h-[330px]">
                    <EquityCurve data={stats.equityCurve} />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-zinc-500">
                    Need more trades to show equity curve
                  </div>
                )}
              </CardContent>
            </Card>
          </ShellCard>

          <ShellCard>
            <Card className="h-full border-0 bg-transparent shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base uppercase tracking-wide text-zinc-100">
                  Performance Summary
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="flex items-center justify-center">
                    <div className="flex h-36 w-36 items-center justify-center rounded-full border-[18px] border-[#50d13f] bg-black/20 shadow-[0_0_40px_rgba(80,209,63,0.15)]">
                      <div className="text-center">
                        <p className="text-3xl font-bold">{stats.winRate}%</p>
                        <p className="text-xs text-zinc-400">Win Rate</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    {[
                      ["Total Trades", stats.totalTrades],
                      ["Win Rate", `${stats.winRate}%`],
                      ["Total P&L", formatMoney(stats.totalPnl)],
                      ["Growth", `${stats.growthPercent}%`],
                      ["Win Streak", stats.longestWinStreak],
                      ["Loss Streak", stats.longestLoseStreak],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0"
                      >
                        <span className="text-zinc-400">{label}</span>
                        <span className="font-mono font-bold text-zinc-100">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </ShellCard>
        </div>

        {/* Secondary grid */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <ShellCard>
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base uppercase tracking-wide text-zinc-100">
                  Key Statistics
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-white/10">
                  <div className="border-b border-r border-white/10 p-3">
                    <p className="text-xs text-zinc-500">Initial Balance</p>
                    <p className="mt-1 font-mono font-bold">
                      {formatMoney(stats.initialBalance)}
                    </p>
                  </div>

                  <div className="border-b border-white/10 p-3">
                    <p className="text-xs text-zinc-500">Net P&L</p>
                    <p className="mt-1 font-mono font-bold text-[#50d13f]">
                      {formatMoney(stats.totalPnl)}
                    </p>
                  </div>

                  <div className="border-b border-r border-white/10 p-3">
                    <p className="text-xs text-zinc-500">Win Streak</p>
                    <p className="mt-1 font-mono font-bold">
                      {stats.longestWinStreak}
                    </p>
                  </div>

                  <div className="border-b border-white/10 p-3">
                    <p className="text-xs text-zinc-500">Loss Streak</p>
                    <p className="mt-1 font-mono font-bold">
                      {stats.longestLoseStreak}
                    </p>
                  </div>

                  <div className="border-r border-white/10 p-3">
                    <p className="text-xs text-zinc-500">Currency</p>
                    <p className="mt-1 font-mono font-bold">
                      {stats.currency || "INR"}
                    </p>
                  </div>

                  <div className="p-3">
                    <p className="text-xs text-zinc-500">Avg R:R</p>
                    <p className="mt-1 font-mono font-bold">
                      {stats.avgRR}R
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ShellCard>

          <ShellCard>
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base uppercase tracking-wide text-zinc-100">
                  Recent Trades
                </CardTitle>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/trades")}
                  className="h-7 gap-1 text-xs text-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </CardHeader>

              <CardContent className="pt-0">
                {stats.recentTrades.length > 0 ? (
                  <div>
                    {stats.recentTrades.slice(0, 5).map((trade) => (
                      <RecentTradeRow key={trade.id} trade={trade} />
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-sm text-zinc-500">
                    No recent trades
                  </p>
                )}
              </CardContent>
            </Card>
          </ShellCard>

          <ShellCard>
            <Card className="h-full border-0 bg-transparent shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base uppercase tracking-wide text-zinc-100">
                  Emotion Breakdown
                </CardTitle>
              </CardHeader>

              <CardContent>
                {Object.keys(stats.emotionBreakdown).length > 0 ? (
                  <div className="h-[240px]">
                    <EmotionChart data={stats.emotionBreakdown} />
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
                    No emotion data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </ShellCard>
        </div>

        {/* Mobile secondary stat strip */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          <MetricCard
            label="Initial Balance"
            value={formatMoney(stats.initialBalance)}
            icon={IndianRupee}
            trend="neutral"
            subtext={stats.currency || "INR"}
          />
          <MetricCard
            label="Loss Streak"
            value={`${stats.longestLoseStreak}`}
            icon={AlertTriangle}
            trend="neutral"
            subtext="Longest losses"
          />
          <MetricCard
            label="Win Streak"
            value={`${stats.longestWinStreak}`}
            icon={Zap}
            trend="neutral"
            subtext="Longest wins"
          />
          <MetricCard
            label="Risk Reward"
            value={`${stats.avgRR}R`}
            icon={BarChart3}
            trend="neutral"
            subtext="Average R:R"
          />
        </div>
      </div>
    </div>
  );
}