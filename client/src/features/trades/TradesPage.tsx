// client/src/features/trades/TradesPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";
import { Trade } from "@/types";
import { PaginatedTrades } from "@/types";
import { getTradesApi, deleteTradeApi } from "./trades.api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  formatCurrency,
  formatDate,
  getPnlColor,
  getEmotionColor,
  getEmotionLabel,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

function TradeRow({
  trade,
  onEdit,
  onDelete,
}: {
  trade: Trade;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-b border-border hover:bg-accent/40 transition-colors group"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center justify-center w-4 h-4 rounded-full",
              trade.isWin ? "bg-forge-500/10" : "bg-red-500/10"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                trade.isWin ? "bg-forge-500" : "bg-red-500"
              )}
            />
          </span>
          <span className="font-mono font-medium text-sm">{trade.pair}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge
          variant={trade.direction === "LONG" ? "success" : "destructive"}
          className="text-[10px]"
        >
          {trade.direction === "LONG" ? (
            <TrendingUp className="h-2.5 w-2.5 mr-1" />
          ) : (
            <TrendingDown className="h-2.5 w-2.5 mr-1" />
          )}
          {trade.direction}
        </Badge>
      </td>
      <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
        {trade.entryPrice.toFixed(5)}
      </td>
      <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
        {trade.exitPrice.toFixed(5)}
      </td>
      <td className="px-4 py-3">
        <span
          className="font-mono text-sm font-semibold"
          style={{ color: getPnlColor(trade.pnl) }}
        >
          {formatCurrency(trade.pnl)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-sm text-muted-foreground">{trade.rrRatio}R</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: getEmotionColor(trade.emotion) }}
          />
          <span className="text-xs text-muted-foreground">{getEmotionLabel(trade.emotion)}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(trade.closedAt)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(trade.id)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(trade.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </motion.tr>
  );
}

export function TradesPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<PaginatedTrades | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [directionFilter, setDirectionFilter] = useState<string>("");
  const [emotionFilter, setEmotionFilter] = useState<string>("");

  const loadTrades = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTradesApi({
        page,
        limit: 15,
        direction: directionFilter || undefined,
        emotion: emotionFilter || undefined,
      });
      setResult(data);
    } catch {
      toast({ title: "Failed to load trades", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, directionFilter, emotionFilter]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trade? This cannot be undone.")) return;
    try {
      await deleteTradeApi(id);
      toast({ title: "Trade deleted", variant: "default" });
      loadTrades();
    } catch {
      toast({ title: "Failed to delete trade", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Trade Journal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {result ? `${result.total} trades recorded` : "Your complete trade history"}
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/trades/new")}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Log Trade
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <Select
          value={directionFilter}
          onValueChange={(v) => { setDirectionFilter(v === "all" ? "" : v); setPage(1); }}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Directions</SelectItem>
            <SelectItem value="LONG">Long</SelectItem>
            <SelectItem value="SHORT">Short</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={emotionFilter}
          onValueChange={(v) => { setEmotionFilter(v === "all" ? "" : v); setPage(1); }}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Emotion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Emotions</SelectItem>
            {["CONFIDENT","NEUTRAL","ANXIOUS","FEARFUL","GREEDY","FOMO","REVENGE"].map((e) => (
              <SelectItem key={e} value={e}>{e.charAt(0) + e.slice(1).toLowerCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(directionFilter || emotionFilter) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => { setDirectionFilter(""); setEmotionFilter(""); setPage(1); }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Pair","Dir","Entry","Exit","P&L","R:R","Emotion","Date",""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[...Array(9)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : result?.trades.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyState
                        icon={BookOpen}
                        title="No trades found"
                        description={
                          directionFilter || emotionFilter
                            ? "Try clearing your filters to see more trades."
                            : "Start logging your trades to build your journal."
                        }
                        action={
                          !directionFilter && !emotionFilter
                            ? { label: "Log First Trade", onClick: () => navigate("/trades/new") }
                            : undefined
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  result?.trades.map((trade) => (
                    <TradeRow
                      key={trade.id}
                      trade={trade}
                      onEdit={(id) => navigate(`/trades/${id}/edit`)}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {result && result.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Page {result.page} of {result.totalPages} · {result.total} trades
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === result.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
