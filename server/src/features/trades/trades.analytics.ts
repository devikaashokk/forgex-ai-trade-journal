// server/src/features/trades/trades.analytics.ts
import { Trade } from "@prisma/client";

/**
 * Calculate P&L for a trade based on direction and prices.
 * Uses simplified pip-based calculation for forex.
 */
export function calculatePnl(
  direction: "LONG" | "SHORT",
  entryPrice: number,
  exitPrice: number,
  lotSize: number
): number {
  const pipValue = 10; // Standard lot = $10/pip, adjust per lot
  const pipDiff =
    direction === "LONG"
      ? (exitPrice - entryPrice) * 10000
      : (entryPrice - exitPrice) * 10000;

  return Math.round(pipDiff * pipValue * lotSize * 100) / 100;
}

/**
 * Calculate achieved Risk/Reward ratio.
 */
export function calculateRR(
  direction: "LONG" | "SHORT",
  entryPrice: number,
  exitPrice: number,
  stopLoss: number
): number {
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(exitPrice - entryPrice);
  if (risk === 0) return 0;
  const rr = direction === "LONG"
    ? (exitPrice > entryPrice ? reward / risk : -(reward / risk))
    : (exitPrice < entryPrice ? reward / risk : -(reward / risk));
  return Math.round(rr * 100) / 100;
}

/**
 * Determine if a trade is a win.
 */
export function determineWin(direction: "LONG" | "SHORT", pnl: number): boolean {
  return pnl > 0;
}

/**
 * Build equity curve from sorted trades.
 */
export function buildEquityCurve(
  trades: Trade[]
): { date: string; equity: number }[] {
  let running = 0;
  return trades.map((t) => {
    running += t.pnl;
    return {
      date: t.closedAt.toISOString().split("T")[0],
      equity: Math.round(running * 100) / 100,
    };
  });
}

/**
 * Calculate win/loss streaks.
 */
export function calculateStreaks(trades: Trade[]): {
  longestWin: number;
  longestLoss: number;
} {
  let maxWin = 0, maxLoss = 0, curWin = 0, curLoss = 0;
  for (const t of trades) {
    if (t.isWin) {
      curWin++;
      curLoss = 0;
      maxWin = Math.max(maxWin, curWin);
    } else {
      curLoss++;
      curWin = 0;
      maxLoss = Math.max(maxLoss, curLoss);
    }
  }
  return { longestWin: maxWin, longestLoss: maxLoss };
}
