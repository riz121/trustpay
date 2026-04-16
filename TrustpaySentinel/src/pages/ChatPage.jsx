import React, { useState, useEffect, useRef } from "react";
import adminApi from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, User, Headphones, CheckCircle2, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusConfig = {
  waiting:  { label: "Waiting",  color: "bg-amber-500/10 text-amber-600",      dot: "bg-amber-500" },
  active:   { label: "Active",   color: "bg-emerald-500/10 text-emerald-600",  dot: "bg-emerald-500" },
  resolved: { label: "Resolved", color: "bg-muted text-muted-foreground",       dot: "bg-muted-foreground" },
  closed:   { label: "Closed",   color: "bg-muted text-muted-foreground",       dot: "bg-muted-foreground" },
};

export default function ChatPage() {
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const { user: adminUser } = useAuth();

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => adminApi.getConversations(),
    initialData: [],
    refetchInterval: 5000,
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", selectedConvo?.id],
    queryFn: () => selectedConvo ? adminApi.getMessages(selectedConvo.id) : [],
    initialData: [],
    enabled: !!selectedConvo,
    refetchInterval: 3000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      await adminApi.createMessage({
        conversation_id: selectedConvo.id,
        sender_type: "admin",
        sender_name: adminUser?.full_name || "Admin",
        sender_email: adminUser?.email || "",
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConvo?.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setMessageText("");
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => adminApi.updateConversation(id, { status: "resolved" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });

  const newConvoMutation = useMutation({
    mutationFn: async () => {
      const convo = await adminApi.createConversation({
        user_email: newEmail.trim(),
        user_name: newEmail.trim().split("@")[0],
        subject: newSubject.trim() || "Admin initiated chat",
        status: "active",
        assigned_to: adminUser?.email,
      });
      return convo;
    },
    onSuccess: (convo) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedConvo(convo);
      setShowNewForm(false);
      setNewEmail("");
      setNewSubject("");
    },
  });

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMutation.mutate(messageText.trim());
  };

  return (
    <div className="flex" style={{ height: "calc(100vh - 64px)" }}>
      {/* Conversations List */}
      <div className="w-[400px] min-w-[400px] border-r border-border bg-card flex flex-col overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Headphones className="w-5 h-5 text-primary" /> Live Chat
            </h2>
            <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => setShowNewForm(v => !v)}>
              {showNewForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{conversations.filter(c => c.status === "waiting" || c.status === "active").length} active conversations</p>
          {showNewForm && (
            <div className="mt-3 space-y-2">
              <Input placeholder="User email..." value={newEmail} onChange={e => setNewEmail(e.target.value)} className="text-xs h-8" />
              <Input placeholder="Subject (optional)..." value={newSubject} onChange={e => setNewSubject(e.target.value)} className="text-xs h-8" />
              <Button size="sm" className="w-full text-xs h-8" disabled={!newEmail.trim() || newConvoMutation.isPending} onClick={() => newConvoMutation.mutate()}>
                Start Conversation
              </Button>
            </div>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1 overflow-hidden">
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No conversations yet</p>
              </div>
            ) : conversations.map(convo => {
              const status = statusConfig[convo.status] || statusConfig.waiting;
              const isSelected = selectedConvo?.id === convo.id;
              return (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConvo(convo)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-all",
                    isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50 border border-transparent"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground truncate">{convo.user_name || convo.user_email}</span>
                    <div className={cn("w-2 h-2 rounded-full", status.dot)} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{convo.last_message || convo.subject || "New conversation"}</p>
                  <div className="flex items-center justify-between mt-1.5 gap-2 w-full">
                    <Badge variant="secondary" className={cn("text-[10px] py-0 shrink-0", status.color)}>{status.label}</Badge>
                    {convo.updated_date && <span className="text-[10px] text-muted-foreground shrink-0">{format(new Date(convo.updated_date), "h:mm a")}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedConvo ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{selectedConvo.user_name || selectedConvo.user_email}</h3>
                  <p className="text-xs text-muted-foreground">{selectedConvo.subject || "Support conversation"}</p>
                </div>
              </div>
              {(selectedConvo.status === "active" || selectedConvo.status === "waiting") && (
                <Button variant="outline" size="sm" onClick={() => resolveMutation.mutate(selectedConvo.id)} className="gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                </Button>
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map(msg => (
                  <div key={msg.id} className={cn("flex", msg.sender_type === "admin" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-3",
                      msg.sender_type === "admin"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border rounded-bl-md"
                    )}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={cn(
                        "text-[10px] mt-1",
                        msg.sender_type === "admin" ? "text-primary-foreground/60" : "text-muted-foreground"
                      )}>
                        {msg.sender_name} • {msg.created_date ? format(new Date(msg.created_date), "h:mm a") : ""}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-3 max-w-3xl mx-auto">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!messageText.trim()} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
