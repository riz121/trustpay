import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
        <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
        <p className="text-xs text-primary">Active Users: {payload[0]?.value}</p>
      </div>
    );
  }
  return null;
};

export default function ActiveUsersChart({ transactions }) {
  const data = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      const dayStr = format(date, "yyyy-MM-dd");
      const dayTx = transactions.filter(t => t.created_date?.startsWith(dayStr));
      // Unique senders on that day
      const uniqueUsers = new Set([
        ...dayTx.map(t => t.sender_email).filter(Boolean),
        ...dayTx.map(t => t.recipient_email).filter(Boolean),
      ]).size;
      return {
        day: format(date, "MMM d"),
        users: uniqueUsers,
      };
    });
  }, [transactions]);

  const today = data[data.length - 1]?.users ?? 0;
  const yesterday = data[data.length - 2]?.users ?? 0;
  const trend = yesterday > 0 ? (((today - yesterday) / yesterday) * 100).toFixed(1) : 0;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Active User Trends</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Unique users transacting daily</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{today}</p>
          <p className={`text-xs font-medium ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs yesterday
          </p>
        </div>
      </div>
      <div className="h-[240px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="userLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(217,91%,60%)" />
                <stop offset="100%" stopColor="hsl(280,65%,60%)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" strokeOpacity={0.5} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="users"
              stroke="hsl(217,91%,60%)"
              strokeWidth={2.5}
              dot={{ fill: "hsl(217,91%,60%)", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}