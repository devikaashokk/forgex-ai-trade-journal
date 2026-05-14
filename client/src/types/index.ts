// client/src/types/index.ts

export type TradeDirection = "LONG" | "SHORT";

export type TradeEmotion =
  | "CONFIDENT"
  | "ANXIOUS"
  | "GREEDY"
  | "FEARFUL"
  | "NEUTRAL"
  | "FOMO"
  | "REVENGE";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  initialBalance: number;
  currency: string;
}

export interface Trade {
  id: string;
  userId: string;
  pair: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  pnl: number;
  rrRatio: number;
  emotion: TradeEmotion;
  notes: string;
  isWin: boolean;
  openedAt: string;
  closedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TradeFormData {
  pair: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  emotion: TradeEmotion;
  notes: string;
  openedAt: string;
  closedAt: string;
}

export interface DashboardStats {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  avgRR: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  bestTrade: number;
  worstTrade: number;
  emotionBreakdown: Record<string, number>;
  equityCurve: { date: string; equity: number }[];
  recentTrades: Trade[];
  initialBalance: number;
  currentBalance: number;
  currency: string;
  growthPercent: number;
}

export interface AIAnalysis {
  emotionalPatterns: string[];
  disciplineScore: number;
  suggestions: string[];
  overallFeedback: string;
  riskWarnings: string[];
}

export interface PaginatedTrades {
  trades: Trade[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
