import React, { useState } from "react";
import adminApi from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, UserPlus, Trash2, Shield, Mail, Crown, DollarSign, Save, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const CURRENCIES = [
  { code: "AED", name: "UAE Dirham" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "BHD", name: "Bahraini Dinar" },
  { code: "OMR", name: "Omani Rial" },
  { code: "INR", name: "Indian Rupee" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "EGP", name: "Egyptian Pound" },
];

export default function SettingsPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [editPwUser, setEditPwUser] = useState(null);
  const [editPw, setEditPw] = useState("");
  const [showEditPw, setShowEditPw] = useState(false);
  const [editPwLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("admin");
  const [currency, setCurrency] = useState(() => localStorage.getItem("platform_currency") || "AED");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveCurrency = () => {
    localStorage.setItem("platform_currency", currency);
    toast({ title: "Currency updated", description: `Platform currency set to ${currency}.` });
  };

  // Password change is handled client-side via Supabase or the backend /api/auth/me
  // For now, display a toast directing the user to use the auth flow
  const handleChangePassword = () => {
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    toast({ title: "Not implemented", description: "Password changes require the Supabase Auth flow from the client.", variant: "destructive" });
  };

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getAdmins(),
    initialData: [],
  });

  const inviteMutation = useMutation({
    mutationFn: () => adminApi.inviteAdmin({ email: inviteEmail.trim(), role: inviteRole }),
    onSuccess: () => {
      toast({ title: "Invite sent", description: `${inviteEmail} has been invited as ${inviteRole}.` });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowInvite(false);
      setInviteEmail("");
      setInviteRole("admin");
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: (userId) => adminApi.updateAdminRole(userId, { role: "user" }),
    onSuccess: () => {
      toast({ title: "Admin removed", description: "User role has been changed to regular user." });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminApi.updateAdminRole(userId, { role }),
    onSuccess: () => {
      toast({ title: "Role updated", description: "User role has been updated." });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" /> Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage admin access and permissions</p>
        </div>
        <Button onClick={() => setShowInvite(true)} className="gap-2">
          <UserPlus className="w-4 h-4" /> Invite Admin
        </Button>
      </div>

      {/* Admin Users Section */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Admin Users</h2>
          <Badge variant="secondary" className="ml-auto text-xs">{users.length} admins</Badge>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">User</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Email</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Joined</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-border/50 animate-pulse">
                  {Array(5).fill(0).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Shield className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No admin users found</p>
                </td>
              </tr>
            ) : users.map(user => (
              <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {user.full_name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.full_name || "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Select
                    value={user.role}
                    onValueChange={(role) => changeRoleMutation.mutate({ userId: user.id, role })}
                    disabled={changeRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-[130px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-1.5">
                          <Crown className="w-3 h-3 text-amber-500" /> Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="view_only">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3 h-3 text-slate-400" /> View Only
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {user.created_at
                    ? format(new Date(user.created_at), "MMM d, yyyy")
                    : user.created_date
                    ? format(new Date(user.created_date), "MMM d, yyyy")
                    : "—"}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => { setEditPwUser(user); setEditPw(""); setShowEditPw(false); }}
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Password
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1.5 text-xs"
                      onClick={() => removeAdminMutation.mutate(user.id)}
                      disabled={removeAdminMutation.isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Currency Settings Section */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Currency Settings</h2>
        </div>
        <div className="px-6 py-5 flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Platform Currency</label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1.5">This sets the default currency displayed across the platform.</p>
          </div>
          <Button onClick={saveCurrency} className="gap-2 shrink-0">
            <Save className="w-4 h-4" /> Save
          </Button>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
        </div>
        <div className="px-6 py-5 space-y-4 max-w-sm">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">New Password</label>
            <div className="relative">
              <Input
                type={showNewPw ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirmPw ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={!newPassword || !confirmPassword}
            className="gap-2"
          >
            <Lock className="w-4 h-4" />
            Update Password
          </Button>
        </div>
      </div>

      {/* Edit Admin Password Dialog */}
      <Dialog open={!!editPwUser} onOpenChange={(open) => !open && setEditPwUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" /> Change Password
            </DialogTitle>
          </DialogHeader>
          {editPwUser && (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">
                Setting new password for <span className="font-medium text-foreground">{editPwUser.full_name || editPwUser.email}</span>
              </p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">New Password</label>
                <div className="relative">
                  <Input
                    type={showEditPw ? "text" : "password"}
                    placeholder="Enter new password (min. 6 chars)"
                    value={editPw}
                    onChange={e => setEditPw(e.target.value)}
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showEditPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                className="w-full gap-2"
                disabled={!editPw || editPwLoading}
                onClick={() => {
                  toast({ title: "Not implemented", description: "Admin password reset requires a Supabase admin call from the backend.", variant: "destructive" });
                }}
              >
                <Lock className="w-4 h-4" />
                {editPwLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Invite Admin
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address</label>
              <Input
                placeholder="admin@example.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                type="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="view_only">View Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              disabled={!inviteEmail.trim() || inviteMutation.isPending}
              onClick={() => inviteMutation.mutate()}
            >
              {inviteMutation.isPending ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
