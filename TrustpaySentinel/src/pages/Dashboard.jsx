import React from "react";
import adminApi from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import DailyVolumeChart from "@/components/dashboard/DailyVolumeChart";
import SuccessFailureChart from "@/components/dashboard/SuccessFailureChart";
import ActiveUsersChart from "@/components/dashboard/ActiveUsersChart";
import { Zap, Users, AlertTriangle, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => adminApi.getTransactions(),
    initialData: [],
  });

  const { data: disputes } = useQuery({
    queryKey: ["disputes"],
    queryFn: () => adminApi.getDisputes(),
    initialData: [],
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => adminApi.getUsers(),
    initialData: [],
  });

  const totalVolume = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const openDisputes = disputes.filter(d => d.status === "open" || d.status === "under_review").length;
  const successRate = transactions.length > 0
    ? Math.round((transactions.filter(t => t.status === "released").length / transactions.length) * 100)
    : 0;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Sando Pay operations overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Volume"
          value={`AED ${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={Zap}
          iconBg="bg-primary/10"
        />
        <StatCard
          title="Registered Users"
          value={users.length}
          icon={Users}
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          title="Open Disputes"
          value={openDisputes}
          icon={AlertTriangle}
          iconBg="bg-orange-500/10"
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          icon={TrendingUp}
          iconBg="bg-teal-500/10"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DailyVolumeChart transactions={transactions} />
        <SuccessFailureChart transactions={transactions} />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ActiveUsersChart transactions={transactions} />
        </div>
        <RecentActivity />
      </div>
    </div>
  );
}
