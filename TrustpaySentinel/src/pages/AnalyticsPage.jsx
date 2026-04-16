import React from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const userGrowthData = [
  { month: "Jan", users: 1200 }, { month: "Feb", users: 1450 }, { month: "Mar", users: 1800 },
  { month: "Apr", users: 2100 }, { month: "May", users: 2600 }, { month: "Jun", users: 3100 },
  { month: "Jul", users: 3500 }, { month: "Aug", users: 4200 }, { month: "Sep", users: 4800 },
  { month: "Oct", users: 5400 }, { month: "Nov", users: 6100 }, { month: "Dec", users: 7000 },
];

const transactionTypeData = [
  { name: "Transfers", value: 45 }, { name: "Payments", value: 30 },
  { name: "Deposits", value: 15 }, { name: "Withdrawals", value: 10 },
];

const dailyVolume = [
  { day: "Mon", volume: 12500 }, { day: "Tue", volume: 15800 },
  { day: "Wed", volume: 14200 }, { day: "Thu", volume: 18900 },
  { day: "Fri", volume: 22100 }, { day: "Sat", volume: 8500 },
  { day: "Sun", volume: 6200 },
];

const COLORS = ["hsl(217, 91%, 60%)", "hsl(160, 60%, 45%)", "hsl(43, 74%, 66%)", "hsl(280, 65%, 60%)"];

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* User Growth */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-1">User Growth</h3>
          <p className="text-sm text-muted-foreground mb-6">Total registered users over time</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="hsl(217, 91%, 60%)" strokeWidth={2.5} fill="url(#userGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Types */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-1">Transaction Types</h3>
          <p className="text-sm text-muted-foreground mb-6">Distribution by transaction category</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={transactionTypeData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                  {transactionTypeData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span className="text-sm text-foreground">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Volume */}
      <div className="bg-card rounded-2xl p-6 border border-border/50">
        <h3 className="text-lg font-semibold text-foreground mb-1">Daily Transaction Volume</h3>
        <p className="text-sm text-muted-foreground mb-6">Average daily volume this week</p>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" strokeOpacity={0.5} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(val) => [`$${val.toLocaleString()}`, "Volume"]} />
              <Bar dataKey="volume" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} barSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}