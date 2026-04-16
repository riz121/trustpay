import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, change, changeType, icon: Icon, iconBg }) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2 tracking-tight">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                changeType === "up" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
              )}>
                {changeType === "up" ? "↑" : "↓"} {change}
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
          iconBg || "bg-primary/10"
        )}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
}