import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  Mail, Send, FileText, Clock, BarChart3, Search, Users, X,
  CheckSquare, Square, Trash2, Edit, Calendar, ChevronLeft,
  ChevronRight, RefreshCw, AlertCircle, CheckCircle, Loader2,
  BookOpen, Trophy, Video, Megaphone, MessageCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const API = "http://localhost:5000/api/v1/email-center";

const CATEGORIES = [
  { value: "assignment",        label: "Assignment / Work",       icon: BookOpen,      color: "text-blue-400" },
  { value: "quiz_notification", label: "Quiz Notification",       icon: Trophy,        color: "text-yellow-400" },
  { value: "quiz_result",       label: "Quiz Results",            icon: CheckCircle,   color: "text-green-400" },
  { value: "live_class",        label: "Live Class Alert",        icon: Video,         color: "text-pink-400" },
  { value: "general",           label: "General Announcement",    icon: Megaphone,     color: "text-purple-400" },
];

const STATUS_BADGE: Record<string, string> = {
  sent:      "bg-green-500/20 text-green-400 border-green-500/30",
  failed:    "bg-red-500/20 text-red-400 border-red-500/30",
  pending:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
const AdminEmailCenter = () => {
  const { user } = useAuth();
  const teacherId = user?.id || "";
  const [tab, setTab] = useState<"compose" | "history" | "drafts" | "analytics">("compose");

  const tabs = [
    { id: "compose",   label: "Compose",   icon: Mail },
    { id: "history",   label: "History",   icon: Clock },
    { id: "drafts",    label: "Drafts",    icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ] as const;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Email Center</h1>
            <p className="text-muted-foreground text-sm">Send, schedule and track emails to your students</p>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              tab === t.id
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-purple-500/30"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "compose"   && <ComposeTab   teacherId={teacherId} onDraftSaved={() => setTab("drafts")} />}
      {tab === "history"   && <HistoryTab   teacherId={teacherId} />}
      {tab === "drafts"    && <DraftsTab    teacherId={teacherId} onEdit={(d) => { setTab("compose"); }} />}
      {tab === "analytics" && <AnalyticsTab teacherId={teacherId} />}
    </div>
  );
};

// ─────────────────────────────────────────
// COMPOSE TAB
// ─────────────────────────────────────────
const ComposeTab = ({ teacherId, onDraftSaved }: { teacherId: string; onDraftSaved: () => void }) => {
  const [students, setStudents]   = useState<any[]>([]);
  const [selected, setSelected]   = useState<string[]>([]);
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("general");
  const [subject, setSubject]     = useState("");
  const [body, setBody]           = useState("");
  const [scheduleAt, setSchedule] = useState("");
  const [sending, setSending]     = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const adminIds = roles?.filter((r: any) => ["admin","super_admin"].includes(r.role)).map((r: any) => r.user_id) || [];
      const { data: profiles } = await supabase.from("profiles").select("user_id, name, email");
      setStudents((profiles || []).filter((p: any) => !adminIds.includes(p.user_id)));
    };
    load();
  }, []);

  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStudent = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const selectAll = () => setSelected(filtered.map((s) => s.user_id));
  const clearAll  = () => setSelected([]);

  const insertPlaceholder = (ph: string) => setBody((b) => b + ` {{${ph}}}`);

  const handleSend = async () => {
    if (!selected.length) return toast.error("Select at least one student");
    if (!subject.trim())  return toast.error("Subject is required");
    if (!body.trim())     return toast.error("Body is required");
    setSending(true);
    try {
      if (scheduleAt) {
        const r = await fetch(`${API}/schedule`, { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherId, recipientIds: selected, category, subject, body, scheduledAt: scheduleAt }) });
        const d = await r.json();
        if (d.success) { toast.success("Email scheduled!"); setSubject(""); setBody(""); setSelected([]); setSchedule(""); }
        else toast.error(d.error || "Schedule failed");
      } else {
        const r = await fetch(`${API}/send`, { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherId, recipientIds: selected, category, subject, body }) });
        const d = await r.json();
        if (d.success) { toast.success(`Sent to ${d.sent} student(s)${d.failed ? `, ${d.failed} failed` : ""}`); setSubject(""); setBody(""); setSelected([]); }
        else toast.error(d.error || "Send failed");
      }
    } catch { toast.error("Could not reach email server"); }
    setSending(false);
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const r = await fetch(`${API}/draft`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, recipientIds: selected, category, subject, body }) });
      const d = await r.json();
      if (d.success) { toast.success("Draft saved"); onDraftSaved(); }
      else toast.error(d.error || "Failed to save draft");
    } catch { toast.error("Could not reach email server"); }
    setSavingDraft(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Student Selector */}
      <div className="lg:col-span-2 space-y-3">
        <Card className="p-4 bg-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white flex items-center gap-2"><Users className="w-4 h-4 text-purple-400" /> Students ({selected.length} selected)</p>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-purple-300 hover:text-purple-200 font-medium">All</button>
              <span className="text-gray-500">·</span>
              <button onClick={clearAll}  className="text-xs text-gray-300 hover:text-gray-200">Clear</button>
            </div>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="w-full bg-white/10 border border-purple-500/20 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-purple-500/30" />
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {filtered.length === 0 && <p className="text-center text-xs text-gray-400 py-4">No students found</p>}
            {filtered.map((s) => {
              const isSelected = selected.includes(s.user_id);
              return (
                <button key={s.user_id} onClick={() => toggleStudent(s.user_id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${isSelected ? "bg-purple-500/20 border border-purple-500/30" : "hover:bg-white/5 border border-transparent"}`}>
                  {isSelected ? <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" /> : <Square className="w-4 h-4 text-gray-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 truncate">{s.email}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Compose Form */}
      <div className="lg:col-span-3 space-y-4">
        {/* Category */}
        <Card className="p-4 bg-card border border-border">
          <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Email Category</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => setCategory(c.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                  category === c.value ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "border-white/5 text-gray-300 hover:bg-white/5 hover:text-white"
                }`}>
                <c.icon className={`w-3.5 h-3.5 ${c.color}`} /> {c.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Subject + Body */}
        <Card className="p-4 bg-card border border-border space-y-4">
          <div>
            <label className="text-xs font-semibold text-white uppercase tracking-wider block mb-2">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Quiz Results — Chapter 3"
              className="w-full bg-white/10 border border-purple-500/20 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-purple-500/30" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-white uppercase tracking-wider">Message</label>
              <div className="flex gap-1">
                {["name","score","courseName","meetingLink","deadline"].map((ph) => (
                  <button key={ph} onClick={() => insertPlaceholder(ph)}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition">
                    {`{{${ph}}}`}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={9}
              placeholder={`Hi {{name}},\n\nYour message here…`}
              className="w-full bg-white/10 border border-purple-500/20 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-purple-500/30 resize-none font-mono" />
          </div>

          {/* Schedule */}
          <div>
            <label className="text-xs font-semibold text-white uppercase tracking-wider block mb-2">Schedule (optional)</label>
            <input type="datetime-local" value={scheduleAt} onChange={(e) => setSchedule(e.target.value)}
              className="bg-white/10 border border-purple-500/20 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500/30" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={handleSend} disabled={sending}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {scheduleAt ? "Schedule Email" : "Send Now"}
            </button>
            <button onClick={handleSaveDraft} disabled={savingDraft}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-purple-500/20 text-gray-300 font-semibold text-sm hover:bg-white/10 transition disabled:opacity-50">
              {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Draft
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// HISTORY TAB
// ─────────────────────────────────────────
const HistoryTab = ({ teacherId }: { teacherId: string }) => {
  const [logs, setLogs]   = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage]   = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/history?teacherId=${teacherId}&page=${page}&limit=${limit}`);
      const d = await r.json();
      if (d.success) { setLogs(d.data); setTotal(d.total); }
    } catch { toast.error("Failed to load history"); }
    setLoading(false);
  }, [teacherId, page]);

  useEffect(() => { if (teacherId) load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  return (
    <Card className="p-4 bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-purple-400" /> Sent History ({total})</h3>
        <button onClick={load} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"><RefreshCw className="w-4 h-4" /></button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500"><Mail className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No emails sent yet</p></div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition">
              <div className="shrink-0 mt-0.5">
                {CATEGORIES.find((c) => c.value === log.category) ? (() => {
                  const Cat = CATEGORIES.find((c) => c.value === log.category)!;
                  return <Cat.icon className={`w-4 h-4 ${Cat.color}`} />;
                })() : <Mail className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-white truncate">{log.subject}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[log.status] || STATUS_BADGE.pending}`}>{log.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{log.recipient_emails?.length || 0} recipients · {new Date(log.sent_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 text-gray-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-gray-400">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 text-gray-400 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────
// DRAFTS TAB
// ─────────────────────────────────────────
const DraftsTab = ({ teacherId, onEdit }: { teacherId: string; onEdit: (d: any) => void }) => {
  const [drafts, setDrafts]   = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/drafts?teacherId=${teacherId}`);
      const d = await r.json();
      if (d.success) setDrafts(d.drafts);
    } catch { toast.error("Failed to load drafts"); }
    setLoading(false);
  };

  useEffect(() => { if (teacherId) load(); }, [teacherId]);

  const deleteDraft = async (id: string) => {
    try {
      await fetch(`${API}/drafts/${id}?teacherId=${teacherId}`, { method: "DELETE" });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      toast.success("Draft deleted");
    } catch { toast.error("Failed to delete draft"); }
  };

  return (
    <Card className="p-4 bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-purple-400" /> Saved Drafts ({drafts.length})</h3>
        <button onClick={load} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"><RefreshCw className="w-4 h-4" /></button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-12 text-gray-500"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No drafts saved</p></div>
      ) : (
        <div className="space-y-2">
          {drafts.map((draft) => (
            <div key={draft.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition">
              <FileText className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{draft.subject || "(No subject)"}</p>
                <p className="text-xs text-gray-500 mt-0.5">{draft.recipient_ids?.length || 0} recipients · {new Date(draft.updated_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => onEdit(draft)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-purple-400 transition"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteDraft(draft.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────
// ANALYTICS TAB
// ─────────────────────────────────────────
const AnalyticsTab = ({ teacherId }: { teacherId: string }) => {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/analytics?teacherId=${teacherId}`);
      const d = await r.json();
      if (d.success) setData(d);
    } catch { toast.error("Failed to load analytics"); }
    setLoading(false);
  };

  useEffect(() => { if (teacherId) load(); }, [teacherId]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  if (!data)   return <div className="text-center py-20 text-gray-500"><AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No analytics data</p></div>;

  const statCards = [
    { label: "Total Emails",      value: data.totalEmails,      icon: Mail,        color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Total Recipients",  value: data.totalRecipients,  icon: Users,       color: "text-blue-400",   bg: "bg-blue-500/10"   },
    { label: "Successfully Sent", value: data.sent,             icon: CheckCircle, color: "text-green-400",  bg: "bg-green-500/10"  },
    { label: "Failed",            value: data.failed,           icon: AlertCircle, color: "text-red-400",    bg: "bg-red-500/10"    },
  ];

  const categoryData = Object.entries(data.byCategory || {}).map(([k, v]) => ({
    name: CATEGORIES.find((c) => c.value === k)?.label || k,
    count: v as number,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5 bg-card border border-border">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 bg-card border border-border">
          <h3 className="font-bold text-foreground mb-4 text-sm">Emails — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.last7}>
              <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #3b1d8a", borderRadius: 10, color: "#fff" }} />
              <Bar dataKey="count" fill="url(#grad)" radius={[6,6,0,0]} />
              <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 bg-card border border-border">
          <h3 className="font-bold text-foreground mb-4 text-sm">Emails by Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-10">No category data yet</p>
          ) : (
            <div className="space-y-3">
              {categoryData.map((c) => {
                const pct = data.totalEmails > 0 ? Math.round((c.count / data.totalEmails) * 100) : 0;
                return (
                  <div key={c.name}>
                    <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{c.name}</span><span>{c.count} ({pct}%)</span></div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminEmailCenter;
