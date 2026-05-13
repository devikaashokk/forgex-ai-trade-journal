// server/src/features/trades/trades.schemas.ts
import { z } from "zod";

export const createTradeSchema = z.object({
  pair: z.string().min(1).max(20),
  direction: z.enum(["LONG", "SHORT"]),
  entryPrice: z.number().positive("Entry price must be positive"),
  exitPrice: z.number().positive("Exit price must be positive"),
  stopLoss: z.number().positive("Stop loss must be positive"),
  takeProfit: z.number().positive("Take profit must be positive"),
  lotSize: z.number().positive("Lot size must be positive").default(0.01),
  emotion: z.enum(["CONFIDENT", "ANXIOUS", "GREEDY", "FEARFUL", "NEUTRAL", "FOMO", "REVENGE"]),
  notes: z.string().max(2000).default(""),
  openedAt: z.string().datetime(),
  closedAt: z.string().datetime(),
});

export const updateTradeSchema = createTradeSchema.partial();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  pair: z.string().optional(),
  direction: z.enum(["LONG", "SHORT"]).optional(),
  emotion: z.enum(["CONFIDENT", "ANXIOUS", "GREEDY", "FEARFUL", "NEUTRAL", "FOMO", "REVENGE"]).optional(),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
