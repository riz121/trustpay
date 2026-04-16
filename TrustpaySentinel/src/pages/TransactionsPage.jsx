import React, { useState, useRef } from "react";
import adminApi from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpRight, ArrowDownLeft, RefreshCw, Zap, AlertOctagon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const statusStyles = {
  pending:    { label: "Pending",     cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  sender_ok:  { label: "Sender OK",  cls: "bg-primary/10 text-primary border-primary/20" },
  released:   { label: "Released",   cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-500/10 text-red-500 border-red-500/20" },
  disputed:   { label: "Disputed",   cls: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
};

const typeIcons = {
  escrow:     ArrowUpRight,
  withdrawal: ArrowDownLeft,
  refund:     RefreshCw,
  fee:        ArrowUpRight,
};

export default function TransactionsPage() {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [typeFilter, setType]     = useState("all");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => adminApi.getTransactions(),
    initialData: [],
    refetchInterval: 5000,
  });

  const filtered = transactions.filter(t => {
    const matchSearch  = !search ||
      t.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
      t.sender_email?.toLowerCase().includes(search.toLowerCase()) ||
      t.recipient_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchType   = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const totalVolume  = filtered.reduce((s, t) => s + (t.amount || 0), 0);
  const flaggedCount = filtered.filter(t => t.flagged || t.status === "disputed").length;
  const pendingCount = filtered.filter(t => t.status === "pending" || t.status === "sender_ok").length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Real-time transaction monitoring</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <p className="text-xs text-muted-foreground font-medium">Total Volume</p>
          <p className="text-2xl font-bold text-foreground mt-1">AED {totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-muted-foreground mt-1">{filtered.length} transactions</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <p className="text-xs text-muted-foreground font-medium">In Progress</p>
          <p className="text-2xl font-bold text-primary mt-1">{pendingCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Pending / Sender OK</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <p className="text-xs text-muted-foreground font-medium">Flagged</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{flaggedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Require review</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by ID, sender, recipient..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sender_ok">Sender OK</SelectItem>
            <SelectItem value="released">Released</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setType}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="escrow">Escrow</SelectItem>
            <SelectItem value="withdrawal">Withdrawal</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
            <SelectItem value="fee">Fee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Transaction ID", "From", "To", "Amount", "Type", "Status", "Time", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-border/50 animate-pulse">
                  {Array(8).fill(0).map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 w-20 bg-muted rounded" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-14 text-center">
                  <Zap className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No transactions found</p>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {filtered.map(tx => {
                  const status = statusStyles[tx.status] || statusStyles.pending;
                  const TxIcon = typeIcons[tx.type] || ArrowUpRight;
                  return (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "border-b border-border/50 hover:bg-muted/30 transition-colors",
                        (tx.flagged || tx.status === "disputed") && "bg-orange-500/5"
                      )}
                    >
                      <td className="px-5 py-3.5 text-sm font-mono text-foreground">{tx.transaction_id || tx.id?.slice(0, 12)}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{tx.sender_name || tx.sender_email || "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{tx.recipient_name || tx.recipient_email || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-foreground">AED {tx.amount?.toLocaleString()}</span>
                        {tx.fee > 0 && <span className="text-xs text-muted-foreground ml-1">+AED {tx.fee} fee</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground capitalize">
                          <TxIcon className="w-3.5 h-3.5" />{tx.type}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", status.cls)}>{status.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {tx.created_at ? format(new Date(tx.created_at), "MMM d, HH:mm:ss") :
                         tx.created_date ? format(new Date(tx.created_date), "MMM d, HH:mm:ss") : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {(tx.flagged || tx.status === "disputed") && (
                          <AlertOctagon className="w-4 h-4 text-orange-500" />
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
