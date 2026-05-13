// client/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TradeEmotion } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, showSign = true): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);

  if (!showSign) return formatted;
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getPnlColor(pnl: number): string {
  return pnl >= 0 ? "#00D4AA" : "#FF4D6D";
}

export function getEmotionColor(emotion: TradeEmotion): string {
  const map: Record<TradeEmotion, string> = {
    CONFIDENT: "#00D4AA",
    NEUTRAL:   "#94A3B8",
    ANXIOUS:   "#F59E0B",
    FEARFUL:   "#F97316",
    GREEDY:    "#A855F7",
    FOMO:      "#EF4444",
    REVENGE:   "#DC2626",
  };
  return map[emotion] ?? "#94A3B8";
}

export function getEmotionLabel(emotion: TradeEmotion): string {
  return emotion.charAt(0) + emotion.slice(1).toLowerCase();
}

export function pairToFlag(pair: string): string {
  const flags: Record<string, string> = {
    EUR: "🇪🇺", USD: "🇺🇸", GBP: "🇬🇧", JPY: "🇯🇵",
    CHF: "🇨🇭", AUD: "🇦🇺", CAD: "🇨🇦", NZD: "🇳🇿",
    SGD: "🇸🇬", HKD: "🇭🇰", NOK: "🇳🇴", SEK: "🇸🇪",
  };
  const parts = pair.replace("/", "").split("");
  const base = pair.split("/")[0];
  const quote = pair.split("/")[1];
  return `${flags[base] ?? "💱"}${flags[quote] ?? ""}`;
}

export function getApiError(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { error?: string; message?: string } } };
    return (
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      "Something went wrong"
    );
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
