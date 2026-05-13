// server/src/features/ai/ai.service.ts
import Groq from "groq-sdk";

import { Trade } from "@prisma/client";
if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is missing in environment variables");
}
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
interface AIAnalysis {
  emotionalPatterns: string[];
  disciplineScore: number;
  suggestions: string[];
  overallFeedback: string;
  riskWarnings: string[];
}

function buildTradeContext(trades: Trade[]): string {
  return trades
    .map(
      (t, i) =>
        `Trade ${i + 1}: ${t.pair} ${t.direction} | P&L: $${t.pnl} | ` +
        `Emotion: ${t.emotion} | RR: ${t.rrRatio} | ` +
        `Notes: "${t.notes || "No notes"}"`
    )
    .join("\n");
}

export async function analyzeTradesWithAI(trades: Trade[]): Promise<AIAnalysis> {
  const model = "llama-3.3-70b-versatile";
  const tradeContext = buildTradeContext(trades.slice(-30));

  const wins = trades.filter((t) => t.isWin).length;
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);

  const emotionCounts = trades.reduce((acc, t) => {
    acc[t.emotion] = (acc[t.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
You are a professional forex trading psychologist.

Return ONLY valid JSON. No markdown. No explanation.

Schema:
{
  "emotionalPatterns": string[],
  "disciplineScore": number,
  "suggestions": string[],
  "overallFeedback": string,
  "riskWarnings": string[]
}

DATA:
Trades: ${trades.length}
WinRate: ${Math.round((wins / trades.length) * 100)}%
P&L: ${totalPnl}
Emotion stats: ${JSON.stringify(emotionCounts)}

Trades:
${tradeContext}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a professional forex trading psychologist. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw =
      completion.choices[0]?.message?.content || "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    const parsed: AIAnalysis = JSON.parse(jsonMatch[0]);

    return {
      emotionalPatterns: parsed.emotionalPatterns ?? [],
      disciplineScore: parsed.disciplineScore ?? 0,
      suggestions: parsed.suggestions ?? [],
      overallFeedback: parsed.overallFeedback ?? "",
      riskWarnings: parsed.riskWarnings ?? [],
    };
  } catch (err: any) {
    console.error("🔥 AI ERROR:", err?.message || err);

    // IMPORTANT: return useful debug info instead of hiding it
    return {
      emotionalPatterns: ["AI failure detected"],
      disciplineScore: 0,
      suggestions: ["Check server logs for API error"],
      overallFeedback: `AI failed: ${err?.message || "unknown error"}`,
      riskWarnings: ["AI integration broken or API issue"],
    };
  }
}

export async function analyzeTradeNote(note: string, emotion: string, pnl: number): Promise<string> {
  const prompt = `As a trading coach, give brief (2-3 sentences) feedback on this trade note.

Trade: Emotion was ${emotion}, P&L was $${pnl}
Note: "${note}"

Be direct and specific. Focus on psychology and discipline. No generic advice.`;
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a trading psychology coach. Keep responses concise and actionable.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return (
      completion.choices[0]?.message?.content?.trim() ||
      "No AI response."
    );
  } catch (err) {
    console.error("🔥 GROQ ERROR:", err);

    return "Unable to analyze note at this time.";
  }
}
