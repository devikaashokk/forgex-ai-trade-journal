// server/src/features/ai/ai.router.ts
import { Router } from "express";
import { getFullAnalysis, analyzeNote } from "./ai.controller";

export const aiRouter = Router();

aiRouter.get("/analyze", getFullAnalysis);
aiRouter.get("/analyze-note/:tradeId", analyzeNote);
