// server/src/features/trades/trades.router.ts
import { Router } from "express";
import {
  createTrade,
  getTrades,
  getTradeById,
  updateTrade,
  deleteTrade,
  getDashboardStats,
} from "./trades.controller";

export const tradesRouter = Router();

tradesRouter.get("/stats/dashboard", getDashboardStats);
tradesRouter.get("/", getTrades);
tradesRouter.get("/:id", getTradeById);
tradesRouter.post("/", createTrade);
tradesRouter.patch("/:id", updateTrade);
tradesRouter.delete("/:id", deleteTrade);
