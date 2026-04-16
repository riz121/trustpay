import React from "react";
import { ShieldX, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

export default function AccessDeniedPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm text-center">
        <div className="bg-sidebar-accent/50 border border-sidebar-border rounded-3xl p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">Access Denied</h1>
          <p className="text-sm text-sidebar-foreground/50 mt-2 leading-relaxed">
            Your account does not have permission to access the TrustPay Admin Portal.
            Please contact your IT administrator if you believe this is an error.
          </p>
          <Button
            variant="outline"
            className="mt-6 gap-2 border-sidebar-border text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
