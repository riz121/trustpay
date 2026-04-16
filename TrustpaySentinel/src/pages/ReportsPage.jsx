import React, { useState } from "react";
import adminApi from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Download, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  generating: { label: "Generating", icon: Clock, color: "bg-amber-500/10 text-amber-600" },
  ready: { label: "Ready", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600" },
  failed: { label: "Failed", icon: AlertCircle, color: "bg-red-500/10 text-red-500" },
};

export default function ReportsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: "transaction", date_range_start: "", date_range_end: "" });
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => adminApi.getReports(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminApi.createReport({
      ...data,
      status: "ready",
      total_transactions: Math.floor(Math.random() * 5000),
      total_amount: Math.floor(Math.random() * 500000),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setOpen(false);
      setForm({ title: "", type: "transaction", date_range_start: "", date_range_end: "" });
    },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and download financial reports</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Generate Report</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Generate New Report</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Report Title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Q1 Revenue Report" className="mt-1.5" />
              </div>
              <div>
                <Label>Report Type</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transaction">Transaction</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="user_activity">User Activity</SelectItem>
                    <SelectItem value="dispute">Dispute</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={form.date_range_start} onChange={e => setForm({ ...form, date_range_start: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={form.date_range_end} onChange={e => setForm({ ...form, date_range_end: e.target.value })} className="mt-1.5" />
                </div>
              </div>
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.title || createMutation.isPending} className="w-full">
                {createMutation.isPending ? "Generating..." : "Generate"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Report</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Type</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Date Range</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Status</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Summary</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-border/50 animate-pulse">
                  {Array(6).fill(0).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                  ))}
                </tr>
              ))
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No reports generated yet</p>
                </td>
              </tr>
            ) : reports.map(report => {
              const status = statusConfig[report.status] || statusConfig.generating;
              return (
                <tr key={report.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{report.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="capitalize text-xs">{report.type?.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {report.date_range_start && report.date_range_end
                      ? `${format(new Date(report.date_range_start), "MMM d")} — ${format(new Date(report.date_range_end), "MMM d, yyyy")}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                      <status.icon className="w-3 h-3" /> {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {report.total_transactions ? `${report.total_transactions.toLocaleString()} txns • $${report.total_amount?.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {report.status === "ready" && (
                      <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
