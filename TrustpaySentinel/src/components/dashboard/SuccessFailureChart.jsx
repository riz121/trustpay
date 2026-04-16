import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays } from "date-fns";

const SUCCESS_STATUSES = ["released", "sender_ok"];
const FAILURE_STATUSES = ["cancelled", "disputed"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
        <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} className="text-xs" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SuccessFailureChart({ transactions }) {
  const data = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStr = format(date, "yyyy-MM-dd");
      const dayTx = transactions.filter(t => t.created_date?.startsWith(dayStr));
      return {
        day: format(date, "EEE"),
        Success: dayTx.filter(t => SUCCESS_STATUSES.includes(t.status)).length,
        Failed: dayTx.filter(t => FAILURE_STATUSES.includes(t.status)).length,
        Pending: dayTx.filter(t => t.status === "pending").length,
      };
    });
  }, [transactions]);

  const total = transactions.length;
  const successCount = transactions.filter(t => SUCCESS_STATUSES.includes(t.status)).length;
  const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : 0;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Success vs Failure Rate</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Last 7 days by status</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-500">{successRate}%</p>
          <p className="text-xs text-muted-foreground">Success rate</p>
        </div>
      </div>
      <div className="h-[240px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Success" fill="hsl(160,60%,45%)" radius={[4,4,0,0]} maxBarSize={28} />
            <Bar dataKey="Pending" fill="hsl(43,74%,66%)" radius={[4,4,0,0]} maxBarSize={28} />
            <Bar dataKey="Failed" fill="hsl(0,84%,60%)" radius={[4,4,0,0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-xs text-muted-foreground">Success</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="text-xs text-muted-foreground">Pending</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-xs text-muted-foreground">Failed</span></div>
      </div>
    </div>
  );
}