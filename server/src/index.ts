// server/src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { authRouter } from "./features/auth/auth.router";
import { tradesRouter } from "./features/trades/trades.router";
import { aiRouter } from "./features/ai/ai.router";
import { errorHandler } from "./middleware/error.middleware";
import { authenticate } from "./middleware/auth.middleware";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security ────────────────────────────────────────────────────────
app.use(helmet()); 
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ── Rate limiting ────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// ── Middleware ───────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── Health check ─────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/trades", authenticate, tradesRouter);
app.use("/api/ai", authenticate, aiRouter);

// ── Error handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 ForgeX API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
