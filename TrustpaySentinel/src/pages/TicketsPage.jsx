import React, { useState } from "react";
import adminApi from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, Eye, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusStyles = {
  open:         { label: "Open",          color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  in_progress:  { label: "In Progress",   color: "bg-primary/10 text-primary border-primary/20" },
  pending_user: { label: "Pending User",  color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  resolved:     { label: "Resolved",      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  closed:       { label: "Closed",        color: "bg-muted text-muted-foreground border-border" },
};

const priorityStyles = {
  low:    "bg-muted text-muted-foreground",
  medium: "bg-amber-500/10 text-amber-600",
  high:   "bg-orange-500/10 text-orange-600",
  urgent: "bg-red-500/10 text-red-500",
};

const categoryLabels = {
  account_issue:     "Account Issue",
  payment_problem:   "Payment Problem",
  fraud_report:      "Fraud Report",
  kyc_appeal:        "KYC Appeal",
  withdrawal_issue:  "Withdrawal Issue",
  other:             "Other",
};

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState("");
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => adminApi.getTickets(),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setSelected(null);
      setResolution("");
    },
  });

  const filtered = tickets.filter(t => {
    const matchSearch = !search ||
      t.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
      t.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const openCount = tickets.filter(t => t.status === "open").length;
  const urgentCount = tickets.filter(t => t.priority === "urgent" && t.status !== "closed" && t.status !== "resolved").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Complaints & Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and resolve user complaints</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending_user">Pending User</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-[240px]" />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <p className="text-xs text-muted-foreground font-medium">Open Tickets</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{openCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <p className="text-xs text-muted-foreground font-medium">In Progress</p>
          <p className="text-2xl font-bold text-primary mt-1">{inProgressCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Being handled</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <p className="text-xs text-muted-foreground font-medium">Urgent</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{urgentCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Ticket #", "User", "Subject", "Category", "Priority", "Status", "Submitted", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-border/50 animate-pulse">
                  {Array(8).fill(0).map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 w-20 bg-muted rounded" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-14 text-center">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No tickets found</p>
                </td>
              </tr>
            ) : filtered.map(ticket => {
              const status = statusStyles[ticket.status] || statusStyles.open;
              return (
                <tr key={ticket.id} className={cn(
                  "border-b border-border/50 hover:bg-muted/30 transition-colors",
                  ticket.priority === "urgent" && "bg-red-500/5"
                )}>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold font-mono bg-primary/10 text-primary px-2 py-1 rounded-md">
                      {ticket.ticket_number || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{ticket.user_email}</td>
                  <td className="px-5 py-4 text-sm text-foreground font-medium max-w-[200px] truncate">{ticket.subject}</td>
                  <td className="px-5 py-4">
                    <Badge variant="secondary" className="text-xs">
                      {categoryLabels[ticket.category] || ticket.category}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", priorityStyles[ticket.priority])}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", status.color)}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">
                    {ticket.created_date ? format(new Date(ticket.created_date), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => { setSelected(ticket); setResolution(""); }} className="gap-1.5 text-xs">
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
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Ticket Details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Ticket</span>
                <span className="text-sm font-bold font-mono text-primary ml-auto">{selected.ticket_number || "—"}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">User</span><p className="font-medium mt-0.5">{selected.user_email}</p></div>
                <div><span className="text-muted-foreground">Category</span><p className="mt-0.5">{categoryLabels[selected.category] || selected.category}</p></div>
                <div><span className="text-muted-foreground">Priority</span>
                  <p className="mt-0.5">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", priorityStyles[selected.priority])}>
                      {selected.priority}
                    </span>
                  </p>
                </div>
                <div><span className="text-muted-foreground">Status</span>
                  <p className="mt-0.5">
                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", statusStyles[selected.status]?.color)}>
                      {statusStyles[selected.status]?.label}
                    </span>
                  </p>
                </div>
                {selected.linked_transaction_id && (
                  <div className="col-span-2"><span className="text-muted-foreground">Linked Transaction</span><p className="font-mono font-medium mt-0.5">{selected.linked_transaction_id}</p></div>
                )}
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Subject</span>
                <p className="font-medium mt-0.5">{selected.subject}</p>
              </div>

              {selected.description && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Description</span>
                  <p className="mt-1 text-foreground bg-muted/50 rounded-lg p-3 text-sm leading-relaxed">{selected.description}</p>
                </div>
              )}

              {selected.resolution_notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Resolution Notes</span>
                  <p className="mt-1 text-foreground bg-muted/50 rounded-lg p-3 text-sm">{selected.resolution_notes}</p>
                </div>
              )}

              {selected.status !== "resolved" && selected.status !== "closed" && (
                <div className="border-t border-border pt-4 space-y-3">
                  <Textarea
                    placeholder="Add resolution notes or response (required for audit)..."
                    value={resolution}
                    onChange={e => setResolution(e.target.value)}
                    className="h-20 text-sm"
                  />
                  <div className="flex gap-2 flex-wrap">
                    {selected.status === "open" && (
                      <Button size="sm" variant="outline" className="gap-1.5"
                        onClick={() => updateMutation.mutate({ id: selected.id, data: { status: "in_progress" } })}>
                        <Clock className="w-3.5 h-3.5" /> Take Ownership
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="gap-1.5"
                      onClick={() => updateMutation.mutate({ id: selected.id, data: { status: "pending_user", resolution_notes: resolution } })}>
                      <AlertTriangle className="w-3.5 h-3.5" /> Awaiting User
                    </Button>
                    <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => updateMutation.mutate({ id: selected.id, data: { status: "resolved", resolution_notes: resolution } })}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-muted-foreground"
                      onClick={() => updateMutation.mutate({ id: selected.id, data: { status: "closed", resolution_notes: resolution } })}>
                      <XCircle className="w-3.5 h-3.5" /> Close
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
