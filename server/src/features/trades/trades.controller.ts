// server/src/features/trades/trades.controller.ts
import { Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/error.middleware";
import { createTradeSchema, updateTradeSchema, paginationSchema } from "./trades.schemas";
import { AuthRequest } from "../../middleware/auth.middleware";
import {
  calculatePnl,
  calculateRR,
  determineWin,
  buildEquityCurve,
  calculateStreaks,
} from "./trades.analytics";

export async function createTrade(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = createTradeSchema.parse(req.body);
    const userId = req.userId!;

    const pnl = calculatePnl(body.direction, body.entryPrice, body.exitPrice, body.lotSize);
    const rrRatio = calculateRR(body.direction, body.entryPrice, body.exitPrice, body.stopLoss);
    const isWin = determineWin(body.direction, pnl);

    const trade = await prisma.trade.create({
      data: {
        userId,
        pair: body.pair.toUpperCase(),
        direction: body.direction,
        entryPrice: body.entryPrice,
        exitPrice: body.exitPrice,
        stopLoss: body.stopLoss,
        takeProfit: body.takeProfit,
        lotSize: body.lotSize,
        pnl,
        rrRatio,
        emotion: body.emotion,
        notes: body.notes,
        isWin,
        openedAt: new Date(body.openedAt),
        closedAt: new Date(body.closedAt),
      },
    });

    res.status(201).json({ success: true, data: { trade } });
  } catch (err) {
    next(err);
  }
}

export async function getTrades(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, pair, direction, emotion } = paginationSchema.parse(req.query);
    const userId = req.userId!;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(pair && { pair: { contains: pair.toUpperCase() } }),
      ...(direction && { direction }),
      ...(emotion && { emotion }),
    };

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { closedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.trade.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        trades,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTradeById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const trade = await prisma.trade.findFirst({
      where: { id, userId: req.userId },
    });
    if (!trade) throw new AppError("Trade not found", 404);
    res.json({ success: true, data: { trade } });
  } catch (err) {
    next(err);
  }
}

export async function updateTrade(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const body = updateTradeSchema.parse(req.body);

    const existing = await prisma.trade.findFirst({ where: { id, userId: req.userId } });
    if (!existing) throw new AppError("Trade not found", 404);

    const direction = body.direction ?? existing.direction;
    const entryPrice = body.entryPrice ?? existing.entryPrice;
    const exitPrice = body.exitPrice ?? existing.exitPrice;
    const stopLoss = body.stopLoss ?? existing.stopLoss;
    const lotSize = body.lotSize ?? existing.lotSize;

    const pnl = calculatePnl(direction, entryPrice, exitPrice, lotSize);
    const rrRatio = calculateRR(direction, entryPrice, exitPrice, stopLoss);
    const isWin = determineWin(direction, pnl);

    const trade = await prisma.trade.update({
      where: { id },
      data: {
        ...body,
        pair: body.pair?.toUpperCase(),
        pnl,
        rrRatio,
        isWin,
        openedAt: body.openedAt ? new Date(body.openedAt) : undefined,
        closedAt: body.closedAt ? new Date(body.closedAt) : undefined,
      },
    });

    res.json({ success: true, data: { trade } });
  } catch (err) {
    next(err);
  }
}

export async function deleteTrade(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const existing = await prisma.trade.findFirst({ where: { id, userId: req.userId } });
    if (!existing) throw new AppError("Trade not found", 404);

    await prisma.trade.delete({ where: { id } });
    res.json({ success: true, message: "Trade deleted successfully" });
  } catch (err) {
    next(err);
  }
}

export async function getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;

    const allTrades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { closedAt: "asc" },
    });

    if (allTrades.length === 0) {
      res.json({
        success: true,
        data: {
          totalTrades: 0,
          winRate: 0,
          totalPnl: 0,
          avgRR: 0,
          longestWinStreak: 0,
          longestLoseStreak: 0,
          bestTrade: 0,
          worstTrade: 0,
          emotionBreakdown: {},
          equityCurve: [],
          recentTrades: [],
        },
      });
      return;
    }

    const wins = allTrades.filter((t) => t.isWin);
    const totalPnl = allTrades.reduce((sum, t) => sum + t.pnl, 0);
    const avgRR = allTrades.reduce((sum, t) => sum + t.rrRatio, 0) / allTrades.length;
    const { longestWin, longestLoss } = calculateStreaks(allTrades);
    const bestTrade = Math.max(...allTrades.map((t) => t.pnl));
    const worstTrade = Math.min(...allTrades.map((t) => t.pnl));

    const emotionBreakdown: Record<string, number> = {};
    for (const t of allTrades) {
      emotionBreakdown[t.emotion] = (emotionBreakdown[t.emotion] || 0) + 1;
    }

    const equityCurve = buildEquityCurve(allTrades);
    const recentTrades = [...allTrades].reverse().slice(0, 10);

    res.json({
      success: true,
      data: {
        totalTrades: allTrades.length,
        winRate: Math.round((wins.length / allTrades.length) * 100 * 10) / 10,
        totalPnl: Math.round(totalPnl * 100) / 100,
        avgRR: Math.round(avgRR * 100) / 100,
        longestWinStreak: longestWin,
        longestLoseStreak: longestLoss,
        bestTrade: Math.round(bestTrade * 100) / 100,
        worstTrade: Math.round(worstTrade * 100) / 100,
        emotionBreakdown,
        equityCurve,
        recentTrades,
      },
    });
  } catch (err) {
    next(err);
  }
}
