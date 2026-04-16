import React, { useState } from "react";
import adminApi from "@/api/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldOff, Ban, Trash2, CheckCircle2, Mail, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";

const verificationStyles = {
  unverified:           { label: "Unverified",   cls: "bg-muted text-muted-foreground" },
  pending_verification: { label: "Pending KYC",  cls: "bg-amber-500/10 text-amber-600" },
  uae_verified:         { label: "UAE Verified", cls: "bg-emerald-500/10 text-emerald-600" },
};

const accountStatusStyles = {
  active:           { label: "Active",          cls: "bg-emerald-500/10 text-emerald-600" },
  suspended:        { label: "Suspended",        cls: "bg-amber-500/10 text-amber-600" },
  banned:           { label: "Banned",           cls: "bg-red-500/10 text-red-500" },
  pending_deletion: { label: "Pending Deletion", cls: "bg-muted text-muted-foreground" },
};

export default function UserActionDialog({ user, open, onClose }) {
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => adminApi.updateUserStatus(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setNotes("");
      onClose();
    },
  });

  const handleAction = (updates) => {
    updateMutation.mutate({ ...updates, internal_notes: notes || undefined });
  };

  if (!user) return null;

  const verification = verificationStyles[user.verification_level] || verificationStyles.unverified;
  const accountStatus = accountStatusStyles[user.account_status] || accountStatusStyles.active;
  const isPending = user.verification_level === "pending_verification";
  const isActive = !user.account_status || user.account_status === "active";
  const isBanned = user.account_status === "banned";

  const joinedDate = user.created_at || user.created_date;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {user.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            {user.full_name || "Unknown User"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-1">
          {/* User Info */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-3.5 h-3.5" /> {user.email}
            </div>
            {joinedDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Joined {format(new Date(joinedDate), "MMM d, yyyy")}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="w-3.5 h-3.5" />
              <span className="capitalize">{user.subscription_plan || "free"} plan</span>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", verification.cls)}>
                {verification.label}
              </span>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", accountStatus.cls)}>
                {accountStatus.label}
              </span>
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Internal Notes (audit trail)
            </label>
            <Textarea
              placeholder="Reason for this action..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="text-sm h-20"
            />
          </div>

          {/* KYC Actions */}
          {isPending && (
            <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">KYC Review</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleAction({ verification_level: "uae_verified" })}
                  disabled={updateMutation.isPending}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve KYC
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1.5 border-red-500/30 text-red-500 hover:bg-red-500/5"
                  onClick={() => handleAction({ verification_level: "unverified" })}
                  disabled={updateMutation.isPending}
                >
                  <ShieldOff className="w-3.5 h-3.5" /> Reject KYC
                </Button>
              </div>
            </div>
          )}

          {/* Account Actions */}
          <div className="border border-border rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Account Actions</p>
            <div className="flex flex-wrap gap-2">
              {!isActive && (
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleAction({ account_status: "active" })}
                  disabled={updateMutation.isPending}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Reactivate
                </Button>
              )}
              {isActive && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => handleAction({ account_status: "suspended" })}
                  disabled={updateMutation.isPending}
                >
                  <ShieldOff className="w-3.5 h-3.5" /> Suspend
                </Button>
              )}
              {!isBanned && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-red-500/30 text-red-500 hover:bg-red-500/5"
                  onClick={() => handleAction({ account_status: "banned" })}
                  disabled={updateMutation.isPending}
                >
                  <Ban className="w-3.5 h-3.5" /> Ban Account
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-muted-foreground/30 text-muted-foreground hover:bg-muted/30"
                onClick={() => handleAction({ account_status: "pending_deletion" })}
                disabled={updateMutation.isPending}
              >
                <Trash2 className="w-3.5 h-3.5" /> Close Account
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
