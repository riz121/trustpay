import React, { useState } from "react";
import adminApi from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Search, Eye, Clock, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusStyles = {
  open:             { label: "Open",             color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  under_review:     { label: "Under Review",     color: "bg-primary/10 text-primary border-primary/20" },
  resolved_release: { label: "Released",         color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  resolved_refund:  { label: "Refunded",         color: "bg-teal-500/10 text-teal-600 border-teal-500/20" },
  rejected:         { label: "Rejected",         color: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const priorityStyles = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/10 text-amber-600",
  high: "bg-orange-500/10 text-orange-600",
  critical: "bg-red-500/10 text-red-500",
};

export default function DisputesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState("");
  const queryClient = useQueryClient();

  const { data: disputes, isLoading } = useQuery({
    queryKey: ["disputes"],
    queryFn: () => adminApi.getDisputes(),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateDispute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      setSelected(null);
      setResolution("");
    },
  });

  const filtered = disputes.filter(d => {
    const matchSearch = !search ||
      d.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
      d.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      d.ticket_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Disputes</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and resolve payment disputes</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="resolved_release">Released</SelectItem>
              <SelectItem value="resolved_refund">Refunded</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search disputes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-[260px]" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Ticket</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Transaction</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">User</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Amount</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Reason</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Priority</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Status</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Date</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-border/50 animate-pulse">
                  {Array(8).fill(0).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 w-20 bg-muted rounded" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <AlertTriangle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No disputes found</p>
                </td>
              </tr>
            ) : filtered.map(d => {
              const status = statusStyles[d.status] || statusStyles.open;
              return (
                <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold font-mono bg-primary/10 text-primary px-2 py-1 rounded-md">
                      {d.ticket_number || "Pending..."}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-foreground">{d.transaction_id}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{d.user_email}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">AED {d.amount?.toLocaleString()}</td>
                  <td className="px-6 py-4"><Badge variant="secondary" className="capitalize text-xs">{d.reason?.replace(/_/g, " ")}</Badge></td>
                  <td className="px-6 py-4"><span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", priorityStyles[d.priority])}>{d.priority}</span></td>
                  <td className="px-6 py-4"><span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", status.color)}>{status.label}</span></td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{d.created_date ? format(new Date(d.created_date), "MMM d, yyyy") : "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(d)} className="gap-1.5 text-xs">
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-primary" /> Dispute Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              {selected.ticket_number && (
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5">
                  <ShieldAlert className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Ticket</span>
                  <span className="text-sm font-bold font-mono text-primary ml-auto">{selected.ticket_number}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Transaction</span><p className="font-mono font-medium mt-0.5">{selected.transaction_id}</p></div>
                <div><span className="text-muted-foreground">Amount</span><p className="font-semibold mt-0.5">AED {selected.amount?.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">User</span><p className="mt-0.5">{selected.user_email}</p></div>
                <div><span className="text-muted-foreground">Reason</span><p className="capitalize mt-0.5">{selected.reason?.replace(/_/g, " ")}</p></div>
              </div>
              {selected.description && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Description</span>
                  <p className="mt-1 text-foreground bg-muted/50 rounded-lg p-3">{selected.description}</p>
                </div>
              )}
              {(selected.status === "open" || selected.status === "under_review") && (
                <div className="border-t border-border pt-4 space-y-3">
                  <Textarea placeholder="Resolution notes (required for audit trail)..." value={resolution} onChange={e => setResolution(e.target.value)} />
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" onClick={() => updateMutation.mutate({ id: selected.id, data: { status: "under_review" } })} variant="outline" className="gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Under Review
                    </Button>
                    <Button size="sm" onClick={() => updateMutation.mutate({ id: selected.id, data: { status: "resolved_release", resolution_notes: resolution } })} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Release to Recipient
                    </Button>
                    <Button size="sm" onClick={() => updateMutation.mutate({ id: selected.id, data: { status: "resolved_refund", resolution_notes: resolution } })} className="gap-1.5 bg-teal-600 hover:bg-teal-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Refund to Sender
                    </Button>
                    <Button size="sm" onClick={() => updateMutation.mutate({ id: selected.id, data: { status: "rejected", resolution_notes: resolution } })} variant="destructive" className="gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
