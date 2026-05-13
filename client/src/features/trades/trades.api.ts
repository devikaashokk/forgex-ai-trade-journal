// client/src/features/trades/trades.api.ts
import api from "@/lib/api";
import { Trade, TradeFormData, PaginatedTrades } from "@/types";

export interface TradesQueryParams {
  page?: number;
  limit?: number;
  pair?: string;
  direction?: string;
  emotion?: string;
}

export async function getTradesApi(params: TradesQueryParams = {}): Promise<PaginatedTrades> {
  const { data } = await api.get<{ success: boolean; data: PaginatedTrades }>("/trades", {
    params,
  });
  return data.data!;
}

export async function getTradeByIdApi(id: string): Promise<Trade> {
  const { data } = await api.get<{ success: boolean; data: { trade: Trade } }>(`/trades/${id}`);
  return data.data!.trade;
}

export async function createTradeApi(payload: TradeFormData): Promise<Trade> {
  const { data } = await api.post<{ success: boolean; data: { trade: Trade } }>("/trades", payload);
  return data.data!.trade;
}

export async function updateTradeApi(id: string, payload: Partial<TradeFormData>): Promise<Trade> {
  const { data } = await api.patch<{ success: boolean; data: { trade: Trade } }>(
    `/trades/${id}`,
    payload
  );
  return data.data!.trade;
}

export async function deleteTradeApi(id: string): Promise<void> {
  await api.delete(`/trades/${id}`);
}
