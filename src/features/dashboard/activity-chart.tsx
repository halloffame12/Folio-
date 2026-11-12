"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export interface ActivityWeek {
  week: string;
  notes: number;
  completed: number;
}

export function ActivityChart({ data, className }: { data: ActivityWeek[]; className?: string }) {
  return (
    <div className={cn("h-[190px] w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: -26 }}>
          <CartesianGrid
            strokeDasharray="2 4"
            vertical={false}
            stroke="hsl(var(--border))"
          />
          <XAxis
            dataKey="week"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "var(--font-plex-mono)" }}
            dy={6}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "var(--font-plex-mono)" }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--secondary))", opacity: 0.45 }}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 4,
              boxShadow: "0 12px 40px -12px rgb(32 37 34 / 0.22)",
              fontSize: 11,
              fontFamily: "var(--font-inter)",
              padding: "8px 10px",
            }}
            labelStyle={{
              color: "hsl(var(--muted-foreground))",
              fontSize: 9,
              fontFamily: "var(--font-plex-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 4,
            }}
            itemStyle={{ padding: 0 }}
          />
          <Bar
            dataKey="notes"
            name="Notes written"
            fill="hsl(var(--primary))"
            fillOpacity={0.16}
            stroke="hsl(var(--primary))"
            strokeWidth={0.6}
            barSize={14}
            radius={[2, 2, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="completed"
            name="Papers completed"
            stroke="hsl(var(--accent))"
            strokeWidth={1.5}
            dot={{ r: 2.5, fill: "hsl(var(--accent))", strokeWidth: 0 }}
            activeDot={{ r: 3.5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
