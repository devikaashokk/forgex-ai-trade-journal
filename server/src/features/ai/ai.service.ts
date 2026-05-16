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

function normalizeScore(score: unknown): number {
  const value = Number(score);

  if (!Number.isFinite(value)) return 0;

  if (value <= 1) return Math.round(value * 100);

  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildTradeContext(trades: Trade[]): string {
  return trades
    .map(
      (t, i) =>
        `Trade ${i + 1}: ${t.pair} ${t.direction} | P&L: $${Number(t.pnl)} | ` +
        `Emotion: ${t.emotion} | RR: ${Number(t.rrRatio)} | ` +
        `Result: ${t.isWin ? "WIN" : "LOSS"} | ` +
        `Notes: "${t.notes || "No notes"}"`
    )
    .join("\n");
}

export async function analyzeTradesWithAI(trades: Trade[]): Promise<AIAnalysis> {
  const model = "llama-3.3-70b-versatile";

  const recentTrades = trades.slice(-30);
  const tradeContext = buildTradeContext(recentTrades);

  const totalTrades = recentTrades.length;
  const wins = recentTrades.filter((t) => t.isWin).length;
  const losses = totalTrades - wins;

  const totalPnl = recentTrades.reduce(
    (sum, trade) => sum + Number(trade.pnl || 0),
    0
  );

  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

  const avgRR =
    totalTrades > 0
      ? Number(
          (
            recentTrades.reduce(
              (sum, trade) => sum + Number(trade.rrRatio || 0),
              0
            ) / totalTrades
          ).toFixed(2)
        )
      : 0;

  const emotionCounts = recentTrades.reduce((acc, trade) => {
    acc[trade.emotion] = (acc[trade.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
You are a professional forex trading psychology coach.

Return ONLY valid JSON.
No markdown.
No explanation.

Schema:
{
  "emotionalPatterns": string[],
  "disciplineScore": number,
  "suggestions": string[],
  "overallFeedback": string,
  "riskWarnings": string[]
}

IMPORTANT RULES:
- disciplineScore MUST be a whole number from 0 to 100.
- Do NOT return 0.7, 0.8, or decimal score format.
- If win rate is good and P&L is positive, do NOT give an extremely low score.
- Be realistic, balanced, and professional.
- Focus on psychology, risk discipline, fear, greed, confidence, and consistency.
- Do not invent facts outside the data.

SUMMARY:
Total Trades: ${totalTrades}
Wins: ${wins}
Losses: ${losses}
Win Rate: ${winRate}%
Net P&L: ${totalPnl}
Average RR: ${avgRR}
Emotion Stats: ${JSON.stringify(emotionCounts)}

TRADES:
${tradeContext}

Expected scoring guide:
- 80-100 = Strong discipline
- 60-79 = Good but needs refinement
- 40-59 = Developing discipline
- 0-39 = Poor discipline
`;

  try {
    const completion = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a professional forex trading psychology coach. Return ONLY valid JSON with disciplineScore from 0 to 100.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content || "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      emotionalPatterns: Array.isArray(parsed.emotionalPatterns)
        ? parsed.emotionalPatterns
        : [],
      disciplineScore: normalizeScore(parsed.disciplineScore),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      overallFeedback: parsed.overallFeedback || "",
      riskWarnings: Array.isArray(parsed.riskWarnings)
        ? parsed.riskWarnings
        : [],
    };
  } catch (err: any) {
    console.error("🔥 AI ERROR:", err?.message || err);

    return {
      emotionalPatterns: ["AI failure detected"],
      disciplineScore: 0,
      suggestions: ["Check server logs for API error"],
      overallFeedback: `AI failed: ${err?.message || "unknown error"}`,
      riskWarnings: ["AI integration broken or API issue"],
    };
  }
}

export async function analyzeTradeNote(
  note: string,
  emotion: string,
  pnl: number
): Promise<string> {
  const prompt = `As a trading coach, give brief 2-3 sentence feedback on this trade note.

Trade:
Emotion: ${emotion}
P&L: $${pnl}
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
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content?.trim() || "No AI response.";
  } catch (err) {
    console.error("🔥 GROQ ERROR:", err);

    return "Unable to analyze note at this time.";
  }
}