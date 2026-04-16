import React, { useState } from "react";
import adminApi from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Mail, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import UserActionDialog from "@/components/users/UserActionDialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const verificationStyles = {
  unverified:          { label: "Unverified",        cls: "bg-muted text-muted-foreground" },
  pending_verification:{ label: "Pending KYC",       cls: "bg-amber-500/10 text-amber-600" },
  uae_verified:        { label: "UAE Verified",      cls: "bg-emerald-500/10 text-emerald-600" },
};

const accountStatusStyles = {
  active:          { label: "Active",          cls: "bg-emerald-500/10 text-emerald-600" },
  suspended:       { label: "Suspended",       cls: "bg-amber-500/10 text-amber-600" },
  banned:          { label: "Banned",          cls: "bg-red-500/10 text-red-500" },
  pending_deletion:{ label: "Pending Deletion",cls: "bg-muted text-muted-foreground" },
};

const planStyles = {
  free:     "bg-muted text-muted-foreground",
  pro:      "bg-primary/10 text-primary",
  business: "bg-purple-500/10 text-purple-600",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => adminApi.getUsers(),
    initialData: [],
  });

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.account_status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} registered users</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="pending_deletion">Pending Deletion</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-[260px]"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">User</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Email</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">KYC Status</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Account</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Plan</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Joined</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-border/50 animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 w-32 bg-muted rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-48 bg-muted rounded" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-16 bg-muted rounded-full" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-16 bg-muted rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                  <td className="px-6 py-4"></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No users found</p>
                </td>
              </tr>
            ) : filtered.map(user => (
              <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {user.full_name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{user.full_name || "—"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const v = verificationStyles[user.verification_level] || verificationStyles.unverified;
                    return <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", v.cls)}>{v.label}</span>;
                  })()}
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const s = accountStatusStyles[user.account_status] || accountStatusStyles.active;
                    return <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", s.cls)}>{s.label}</span>;
                  })()}
                </td>
                <td className="px-6 py-4">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", planStyles[user.subscription_plan] || planStyles.free)}>
                    {user.subscription_plan || "free"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {user.created_at
                      ? format(new Date(user.created_at), "MMM d, yyyy")
                      : user.created_date
                      ? format(new Date(user.created_date), "MMM d, yyyy")
                      : "—"}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedUser(user)}>
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <UserActionDialog
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
