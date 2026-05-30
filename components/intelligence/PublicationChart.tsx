"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export function PublicationChart({ trends }: { trends: any[] }) {
  // Sort trends by year ascending
  const data = useMemo(() => {
    return [...trends]
      .filter((t) => t.key >= 2014 && t.key <= new Date().getFullYear()) // Last 10-12 years
      .sort((a, b) => a.key - b.key)
      .map((t) => ({
        year: t.key.toString(),
        outputs: t.count,
      }));
  }, [trends]);

  return (
    <div className="p-6 border rounded-xl bg-card text-card-foreground shadow h-[400px] flex flex-col">
      <h3 className="font-semibold text-xl mb-4">Publication Trend (10 Years)</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOutputs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--background))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="outputs"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorOutputs)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
