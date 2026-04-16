import React from "react";
import { AlertTriangle, CheckCircle2, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  { type: "dispute", message: "New dispute #D-4521 opened by john@email.com", time: "2 min ago", icon: AlertTriangle, color: "text-amber-500 bg-amber-500/10" },
  { type: "resolved", message: "Dispute #D-4518 resolved — Refund issued", time: "15 min ago", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
  { type: "pending", message: "3 new KYC verifications pending review", time: "32 min ago", icon: Clock, color: "text-primary bg-primary/10" },
  { type: "transaction", message: "High value transaction $12,500 flagged", time: "1 hr ago", icon: ArrowUpRight, color: "text-red-500 bg-red-500/10" },
  { type: "resolved", message: "Dispute #D-4515 rejected — Insufficient evidence", time: "2 hrs ago", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
];

export default function RecentActivity() {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", activity.color)}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}