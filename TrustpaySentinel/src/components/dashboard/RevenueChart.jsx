import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", revenue: 42000, transactions: 1200 },
  { month: "Feb", revenue: 48000, transactions: 1350 },
  { month: "Mar", revenue: 55000, transactions: 1500 },
  { month: "Apr", revenue: 51000, transactions: 1420 },
  { month: "May", revenue: 62000, transactions: 1680 },
  { month: "Jun", revenue: 71000, transactions: 1890 },
  { month: "Jul", revenue: 68000, transactions: 1750 },
  { month: "Aug", revenue: 78000, transactions: 2100 },
  { month: "Sep", revenue: 85000, transactions: 2280 },
  { month: "Oct", revenue: 82000, transactions: 2150 },
  { month: "Nov", revenue: 92000, transactions: 2450 },
  { month: "Dec", revenue: 98000, transactions: 2600 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
        <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
        <p className="text-xs text-primary">Revenue: ${payload[0].value.toLocaleString()}</p>
        <p className="text-xs text-chart-2">Transactions: {payload[1]?.value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart() {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Monthly revenue & transaction volume</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-chart-2" />
            <span className="text-xs text-muted-foreground">Transactions</span>
          </div>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="transGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" strokeOpacity={0.5} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" strokeWidth={2.5} fill="url(#revenueGrad)" />
            <Area type="monotone" dataKey="transactions" stroke="hsl(160, 60%, 45%)" strokeWidth={2} fill="url(#transGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}