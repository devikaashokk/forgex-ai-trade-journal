// server/src/features/ai/ai.controller.ts
import { Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/error.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";
import { analyzeTradesWithAI, analyzeTradeNote } from "./ai.service";

export async function getFullAnalysis(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;

    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { closedAt: "asc" },
    });

    if (trades.length < 3) {
      throw new AppError("You need at least 3 trades for AI analysis", 400);
    }

    const analysis = await analyzeTradesWithAI(trades);
    res.json({ success: true, data: { analysis } });
  } catch (err) {
    next(err);
  }
}

export async function analyzeNote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tradeId } = req.params;

    const trade = await prisma.trade.findFirst({
      where: { id: tradeId, userId: req.userId },
    });

    if (!trade) throw new AppError("Trade not found", 404);
    if (!trade.notes) throw new AppError("This trade has no notes to analyze", 400);

    const feedback = await analyzeTradeNote(trade.notes, trade.emotion, trade.pnl);
    res.json({ success: true, data: { feedback } });
  } catch (err) {
    next(err);
  }
}
