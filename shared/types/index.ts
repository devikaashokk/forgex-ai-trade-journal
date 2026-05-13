// shared/types/index.ts
// Shared TypeScript types used by both client and server

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
  emotionBreakdown: Record<TradeEmotion, number>;
  equityCurve: { date: string; equity: number }[];
  recentTrades: Trade[];
}

export interface AIAnalysis {
  emotionalPatterns: string[];
  disciplineScore: number;
  suggestions: string[];
  overallFeedback: string;
  riskWarnings: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
