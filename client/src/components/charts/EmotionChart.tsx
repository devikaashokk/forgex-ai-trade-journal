// client/src/components/charts/EmotionChart.tsx
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TradeEmotion } from "@/types";
import { getEmotionColor, getEmotionLabel } from "@/lib/utils";

interface Props {
  data: Record<string, number>;
}

export function EmotionChart({ data }: Props) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  const chartData = entries.map(([emotion, count]) => ({
    name: getEmotionLabel(emotion as TradeEmotion),
    value: count,
    fill: getEmotionColor(emotion as TradeEmotion),
  }));

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={160}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="90%"
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "hsl(var(--muted))" }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                  <p className="text-xs font-medium">{d.name}</p>
                  <p className="text-sm font-semibold" style={{ color: d.fill }}>
                    {d.value} trades ({Math.round((d.value / total) * 100)}%)
                  </p>
                </div>
              );
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-1.5">
        {entries.slice(0, 5).map(([emotion, count]) => (
          <div key={emotion} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getEmotionColor(emotion as TradeEmotion) }}
              />
              <span className="text-xs text-muted-foreground">
                {getEmotionLabel(emotion as TradeEmotion)}
              </span>
            </div>
            <span className="text-xs font-medium number-mono">
              {Math.round((count / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
