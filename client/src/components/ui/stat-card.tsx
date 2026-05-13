// client/src/components/ui/stat-card.tsx
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
  delay?: number;
}

export function StatCard({ label, value, subtext, icon: Icon, trend, className, delay = 0 }: StatCardProps) {
  const trendColor =
    trend === "up" ? "text-forge-500" :
    trend === "down" ? "text-red-500" :
    "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={cn(
        "rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
      </div>
      <p className={cn("text-2xl font-display font-bold number-mono", trendColor)}>{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </motion.div>
  );
}
