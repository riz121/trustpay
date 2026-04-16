import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
        <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
        <p className="text-xs text-primary">Volume: AED {payload[0]?.value?.toLocaleString()}</p>
        <p className="text-xs text-chart-2">Count: {payload[1]?.value}</p>
      </div>
    );
  }
  return null;
};

export default function DailyVolumeChart({ transactions }) {
  const data = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      const dayStr = format(date, "yyyy-MM-dd");
      const dayTx = transactions.filter(t => t.created_date?.startsWith(dayStr));
      return {
        day: format(date, "MMM d"),
        volume: dayTx.reduce((s, t) => s + (t.amount || 0), 0),
        count: dayTx.length,
      };
    });
    return days;
  }, [transactions]);

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Daily Transaction Volume</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Last 14 days — AED volume & count</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-chart-2" />
            <span className="text-xs text-muted-foreground">Count</span>
          </div>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cntGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" strokeOpacity={0.5} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="vol" tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <YAxis yAxisId="cnt" orientation="right" tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area yAxisId="vol" type="monotone" dataKey="volume" stroke="hsl(217,91%,60%)" strokeWidth={2.5} fill="url(#volGrad)" />
            <Area yAxisId="cnt" type="monotone" dataKey="count" stroke="hsl(160,60%,45%)" strokeWidth={2} fill="url(#cntGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}