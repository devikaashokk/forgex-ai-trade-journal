// client/src/features/ai/ai.api.ts
import api from "@/lib/api";
import { AIAnalysis } from "@/types";

export async function getAIAnalysis(): Promise<AIAnalysis> {
  const { data } = await api.get<{ success: boolean; data: { analysis: AIAnalysis } }>(
    "/ai/analyze"
  );
  return data.data!.analysis;
}

export async function analyzeTradeNote(tradeId: string): Promise<string> {
  const { data } = await api.get<{ success: boolean; data: { feedback: string } }>(
    `/ai/analyze-note/${tradeId}`
  );
  return data.data!.feedback;
}
