import React, { useState } from "react";
import adminApi from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Plus, Send, CheckCircle2, Info, AlertTriangle, Megaphone, RefreshCw, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  promo: Megaphone,
  update: RefreshCw,
  alert: ShieldCheck,
};

const typeColors = {
  info: "bg-primary/10 text-primary",
  warning: "bg-amber-500/10 text-amber-600",
  promo: "bg-purple-500/10 text-purple-600",
  update: "bg-chart-2/10 text-chart-2",
  alert: "bg-red-500/10 text-red-500",
};

export default function NotificationsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", message: "", type: "info", target_audience: "all_users", target_email: "",
  });
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => adminApi.getNotifications(),
    initialData: [],
  });

  const sendMutation = useMutation({
    mutationFn: (data) => adminApi.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setOpen(false);
      setForm({ title: "", message: "", type: "info", target_audience: "all_users", target_email: "" });
    },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">Send push notifications to TrustPay app users</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Notification</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Send Notification</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="New Feature Available!" className="mt-1.5" />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Write your notification message..." className="mt-1.5 min-h-[100px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="promo">Promotion</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Audience</Label>
                  <Select value={form.target_audience} onValueChange={v => setForm({ ...form, target_audience: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="active_users">Active Users</SelectItem>
                      <SelectItem value="inactive_users">Inactive Users</SelectItem>
                      <SelectItem value="specific_user">Specific User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.target_audience === "specific_user" && (
                <div>
                  <Label>User Email</Label>
                  <Input value={form.target_email} onChange={e => setForm({ ...form, target_email: e.target.value })} placeholder="user@example.com" className="mt-1.5" />
                </div>
              )}
              <Button
                onClick={() => sendMutation.mutate(form)}
                disabled={!form.title || !form.message || sendMutation.isPending}
                className="w-full gap-2"
              >
                <Send className="w-4 h-4" />
                {sendMutation.isPending ? "Sending..." : "Send Notification"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/50 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-muted rounded" />
                  <div className="h-3 w-72 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
            <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notifications sent yet</p>
          </div>
        ) : notifications.map(n => {
          const TypeIcon = typeIcons[n.type] || Info;
          return (
            <div key={n.id} className="bg-card rounded-2xl border border-border/50 p-5 hover:border-primary/20 transition-all">
              <div className="flex items-start gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", typeColors[n.type] || typeColors.info)}>
                  <TypeIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
                    <Badge variant="secondary" className="capitalize text-[10px]">{n.type}</Badge>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" /> Sent
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="capitalize">{n.target_audience?.replace(/_/g, " ")}</span>
                    {n.sent_at && <span>{format(new Date(n.sent_at), "MMM d, yyyy 'at' h:mm a")}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
