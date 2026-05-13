// client/src/features/trades/trades.schema.ts
import { z } from "zod";

export const tradeSchema = z.object({
  pair: z
    .string()
    .min(1, "Currency pair is required")
    .max(20)
    .transform((v) => v.toUpperCase()),
  direction: z.enum(["LONG", "SHORT"], { required_error: "Direction is required" }),
  entryPrice: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .positive("Must be positive"),
  exitPrice: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .positive("Must be positive"),
  stopLoss: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .positive("Must be positive"),
  takeProfit: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .positive("Must be positive"),
  lotSize: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .positive("Must be positive")
    .default(0.01),
  emotion: z.enum(
    ["CONFIDENT", "ANXIOUS", "GREEDY", "FEARFUL", "NEUTRAL", "FOMO", "REVENGE"],
    { required_error: "Please select your emotional state" }
  ),
  notes: z.string().max(2000).default(""),
  openedAt: z.string().min(1, "Open time is required"),
  closedAt: z.string().min(1, "Close time is required"),
});

export type TradeSchemaType = z.infer<typeof tradeSchema>;

export const FOREX_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF",
  "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP",
  "EUR/JPY", "GBP/JPY", "EUR/CHF", "GBP/CHF",
  "XAU/USD", "XAG/USD",
];

export const EMOTION_OPTIONS = [
  { value: "CONFIDENT", label: "Confident", description: "Clear, disciplined mindset" },
  { value: "NEUTRAL", label: "Neutral", description: "No strong emotional bias" },
  { value: "ANXIOUS", label: "Anxious", description: "Nervous or uncertain about the trade" },
  { value: "FEARFUL", label: "Fearful", description: "Fear of loss affecting decisions" },
  { value: "GREEDY", label: "Greedy", description: "Reaching for more than planned" },
  { value: "FOMO", label: "FOMO", description: "Fear of missing out on a move" },
  { value: "REVENGE", label: "Revenge", description: "Trading to recover recent losses" },
] as const;
