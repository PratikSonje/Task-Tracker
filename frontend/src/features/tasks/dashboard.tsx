import { useState, useCallback } from "react";
import { Search, X, CheckCircle2, Plus, Zap, ArrowRight, ChevronRight, Loader2, Calendar } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { api } from "../../app/api";
import { Task, Page, FilterStatus, Priority, SortKey, TaskFormData } from "../../types";
import { isOverdue, formatRelative, GradBorder, StatCard3D, PriorityBadge, TagChip, STATUS_CFG, TaskCard, TaskModal, DeleteConfirm } from "../../components/ui";

// --- Helpers ---
// WHY: We extract sorting logic to a pure function outside the component so it doesn't get recreated on every render and can be easily unit-tested.
const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
function sortTasks(tasks: Task[], key: SortKey) {
  return [...tasks].sort((a, b) => {
    if (key === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (key === "title") return a.title.localeCompare(b.title);
    if (key === "dueDate") {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1; if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}

// --- HOME PAGE ---
export function HomePage({ tasks, setTasks, setPage }: { tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; setPage: (p: Page) => void }) {
  const [quickTask, setQuickTask] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const done = tasks.filter(t => t.status === "done").length;
  const inProg = tasks.filter(t => t.status === "in-progress").length;
  const overdue = tasks.filter(isOverdue).length;
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
  const recent = [...tasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dueToday = tasks.filter(t => t.dueDate && t.dueDate.split("T")[0] === new Date().toISOString().split("T")[0] && t.status !== "done").length;

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTask.trim()) {
      toast.info("Please type a task name first!");
      return;
    }
    setIsAdding(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const c = await api.createTask({ title: quickTask, description: "", status: "todo", priority: "medium", dueDate: today, tags: [] });
      setTasks(p => [...p, c]);
      setQuickTask("");
      toast.success("Task quickly added!");
    } catch {
      toast.error("Failed to add task");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    try {
      // WHY: Optimistic UI update. We immediately update the local state to provide instant visual feedback to the user, making the app feel instantaneous.
      setTasks(p => p.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
      const updated = await api.updateTask(task._id, { status: newStatus });
      setTasks(p => p.map(t => t._id === task._id ? updated : t));
    } catch {
      toast.error("Failed to update task status");
      // WHY: Rollback state if the API request fails, ensuring the UI remains perfectly in sync with the backend database.
      setTasks(p => p.map(t => t._id === task._id ? { ...t, status: task.status } : t));
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden p-8"
        style={{ background: "linear-gradient(135deg, #0d0d22 0%, #12102e 50%, #0d1a2e 100%)", border: "1px solid rgba(255,45,120,0.2)" }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-40"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,45,120,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(45,106,255,0.3) 0%, transparent 50%)" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-mono"
            style={{ background: "rgba(255,45,120,0.15)", border: "1px solid rgba(255,45,120,0.3)", color: "#ff6eb0" }}>
            <Zap className="w-3 h-3" /> Ready to conquer your day?
          </div>
          <h1 className="text-4xl font-black font-['Syne'] mb-2 text-white pb-2">
            {greeting}, let's <span className="bg-gradient-to-r from-[#ff2d78] via-[#ff6eb0] to-[#2d6aff] bg-clip-text text-transparent inline-block pb-1">get things done.</span>
          </h1>
          <p className="text-[#9090b8] max-w-lg font-['Plus_Jakarta_Sans'] mb-8">
            You have <strong className="text-white">{dueToday}</strong> task{dueToday !== 1 ? 's' : ''} due today and <strong className={overdue > 0 ? "text-[#ff3b55]" : "text-white"}>{overdue}</strong> overdue task{overdue !== 1 ? 's' : ''}.
          </p>

          <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <div className="relative flex-1">
              <input value={quickTask} onChange={e => setQuickTask(e.target.value)} placeholder="Quick add a task... (e.g. Read a book)"
                className="w-full pl-4 pr-4 py-3 rounded-xl text-sm text-white placeholder-[#9090b8] focus:outline-none focus:ring-2 focus:ring-[#ff2d78]/30 transition-all font-['Plus_Jakarta_Sans'] leading-normal"
                style={{ background: "rgba(13,13,34,0.6)", border: "1px solid rgba(255,255,255,0.08)" }} disabled={isAdding} />
            </div>
            <button type="submit" disabled={isAdding}
              className="inline-flex justify-center items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 font-['Plus_Jakarta_Sans']"
              style={{ background: "linear-gradient(135deg, #ff2d78, #2d6aff)", boxShadow: "0 0 30px rgba(255,45,120,0.3)" }}>
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Task</>}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard3D label="Total Tasks" value={tasks.length} color="#ff2d78" />
        <StatCard3D label="In Progress" value={inProg} color="#2d6aff" />
        <StatCard3D label="Completed" value={done} sub={`${pct}% done`} color="#30d158" />
        <StatCard3D label="Overdue" value={overdue} color={overdue > 0 ? "#ff3b55" : "#9090b8"} />
      </div>

      <GradBorder>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white font-['Syne']">Overall Progress</h3>
            <span className="text-2xl font-black font-['Syne']" style={{ color: "#ff2d78" }}>{pct}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #ff2d78, #2d6aff)" }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#9090b8] font-mono">
            <span>{done} completed</span><span>{tasks.length - done} remaining</span>
          </div>
        </div>
      </GradBorder>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white font-['Syne']">Recent Activity</h3>
          <button onClick={() => setPage("tasks")} className="text-xs text-[#ff2d78] hover:underline flex items-center gap-1 font-['Plus_Jakarta_Sans']">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {recent.map(task => {
            const scfg = STATUS_CFG[task.status];
            return (
              <div key={task._id} className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <button onClick={() => handleToggleTask(task)} className="shrink-0 hover:scale-110 transition-transform">
                  <scfg.Icon className="w-4 h-4" style={{ color: scfg.color }} />
                </button>
                <span className={`flex-1 text-sm font-['Plus_Jakarta_Sans'] ${task.status === "done" ? "line-through opacity-50 text-[#9090b8]" : "text-white"}`}>{task.title}</span>
                <PriorityBadge priority={task.priority} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- TASKS PAGE ---
export function TasksPage({ tasks, setTasks }: { tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>> }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // WHY: We derive filtered tasks during render rather than storing them in a separate state array. 
  // This ensures our UI is always perfectly in sync with the source of truth (`tasks` prop) and prevents complex state-desync bugs.
  const filtered = sortTasks(tasks.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q));
    }
    return true;
  }), sortKey);

  const isFiltered = search !== "" || filterStatus !== "all" || filterPriority !== "all";

  // WHY: useCallback memoizes this function so it maintains the same reference across renders.
  // This prevents child components (like TaskModal) from unnecessarily re-rendering.
  const handleSave = useCallback(async (data: TaskFormData) => {
    setSaving(true);
    const tags = data.tags.split(",").map(t => t.trim()).filter(Boolean);
    try {
      if (editingTask) {
        const u = await api.updateTask(editingTask._id, { title: data.title, description: data.description, status: data.status, priority: data.priority, dueDate: data.dueDate || null, tags });
        setTasks(p => p.map(t => t._id === editingTask._id ? u : t));
        toast.success("Task updated");
      } else {
        const c = await api.createTask({ title: data.title, description: data.description, status: data.status, priority: data.priority, dueDate: data.dueDate || null, tags });
        setTasks(p => [...p, c]);
        toast.success("Task created");
      }
      setModalOpen(false); setEditingTask(null);
    } catch { toast.error("Something went wrong"); } finally { setSaving(false); }
  }, [editingTask, setTasks]);

  const handleDelete = useCallback(async () => {
    if (!deletingTask) return;
    setDeleting(true);
    try {
      await api.deleteTask(deletingTask._id);
      setTasks(p => p.filter(t => t._id !== deletingTask._id));
      toast.success("Task deleted"); setDeletingTask(null);
    } catch { toast.error("Could not delete"); } finally { setDeleting(false); }
  }, [deletingTask, setTasks]);

  const handleStatusChange = useCallback(async (task: Task, newStatus: import("./types").Status) => {
    setTasks(p => p.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
    try {
      await api.updateTask(task._id, { status: newStatus });
      toast.success(`Moved to "${STATUS_CFG[newStatus].label}"`);
    } catch {
      setTasks(p => p.map(t => t._id === task._id ? { ...t, status: task.status } : t));
      toast.error("Update failed");
    }
  }, [setTasks]);

  const selectCls = "appearance-none rounded-xl px-3 py-2 text-sm cursor-pointer focus:outline-none pr-8 font-['Plus_Jakarta_Sans']";
  const selectStyle = { background: "#0d0d22", border: "1px solid rgba(255,255,255,0.08)", color: "#f0efff" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black font-['Syne'] text-white">Tasks</h2>
        <button onClick={() => { setEditingTask(null); setModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 font-['Plus_Jakarta_Sans']"
          style={{ background: "linear-gradient(135deg, #ff2d78, #2d6aff)", boxShadow: "0 0 20px rgba(255,45,120,0.3)" }}>
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9090b8]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks, tags..."
            className="w-full pl-10 pr-8 py-2.5 rounded-xl text-sm text-white placeholder-[#9090b8] focus:outline-none focus:ring-2 focus:ring-[#ff2d78]/30 transition-all font-['Plus_Jakarta_Sans']"
            style={{ background: "#0d0d22", border: "1px solid rgba(255,255,255,0.08)" }} />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-[#9090b8]" /></button>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)} className={selectCls} style={selectStyle}>
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | "all")} className={selectCls} style={selectStyle}>
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)} className={selectCls} style={selectStyle}>
            <option value="createdAt">Newest First</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Highest Priority</option>
            <option value="title">A-Z</option>
          </select>
          <button onClick={() => setView(v => v === "grid" ? "list" : "grid")} className="px-3 rounded-xl hover:bg-white/5 transition-colors" style={selectStyle}>
            {view === "grid" ? "List View" : "Grid View"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#9090b8] font-mono">{filtered.length} task{filtered.length !== 1 ? "s" : ""}{isFiltered ? " found" : ""}</p>
        {isFiltered && <button onClick={() => { setSearch(""); setFilterStatus("all"); setFilterPriority("all"); }}
          className="text-xs flex items-center gap-1 hover:underline font-['Plus_Jakarta_Sans']" style={{ color: "#ff2d78" }}>
          <X className="w-3 h-3" />Clear filters
        </button>}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl" style={{ border: "1px dashed rgba(255,255,255,0.1)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,45,120,0.1)" }}>
            {isFiltered ? <Search className="w-6 h-6 text-[#ff2d78]" /> : <CheckCircle2 className="w-6 h-6 text-[#9090b8]" />}
          </div>
          <p className="text-white font-semibold font-['Plus_Jakarta_Sans']">{isFiltered ? "No matching tasks" : "No tasks yet"}</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(task => (
            <TaskCard key={task._id} task={task} view="grid"
              onEdit={t => { setEditingTask(t); setModalOpen(true); }}
              onDelete={setDeletingTask} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(task => (
            <TaskCard key={task._id} task={task} view="list"
              onEdit={t => { setEditingTask(t); setModalOpen(true); }}
              onDelete={setDeletingTask} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {modalOpen && <TaskModal task={editingTask} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingTask(null); }} saving={saving} />}
      {deletingTask && <DeleteConfirm task={deletingTask} onConfirm={handleDelete} onClose={() => setDeletingTask(null)} deleting={deleting} />}
    </div>
  );
}

// --- ANALYTICS PAGE ---
export function AnalyticsPage({ tasks }: { tasks: Task[] }) {
  const byStatus = [
    { name: "To Do", value: tasks.filter(t => t.status === "todo").length, color: "#9090b8" },
    { name: "In Progress", value: tasks.filter(t => t.status === "in-progress").length, color: "#2d6aff" },
    { name: "Done", value: tasks.filter(t => t.status === "done").length, color: "#30d158" },
  ];
  const byPriority = [
    { name: "High", value: tasks.filter(t => t.priority === "high").length, fill: "#ff2d78" },
    { name: "Medium", value: tasks.filter(t => t.priority === "medium").length, fill: "#ffb800" },
    { name: "Low", value: tasks.filter(t => t.priority === "low").length, fill: "#2d6aff" },
  ];
  const byTag: Record<string, number> = {};
  tasks.forEach(t => t.tags.forEach(tag => { byTag[tag] = (byTag[tag] || 0) + 1; }));
  const tagData = Object.entries(byTag).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value, fill: "#ff2d78" }));

  const pct = tasks.length > 0 ? Math.round(tasks.filter(t => t.status === "done").length / tasks.length * 100) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black font-['Syne'] text-white">Analytics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard3D label="Completion" value={`${pct}%`} color="#30d158" />
        <StatCard3D label="High Priority" value={tasks.filter(t => t.priority === "high").length} color="#ff2d78" />
        <StatCard3D label="Overdue" value={tasks.filter(isOverdue).length} color="#ff3b55" />
        <StatCard3D label="Tags Used" value={Object.keys(byTag).length} color="#2d6aff" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GradBorder>
          <div className="p-5">
            <h3 className="font-bold text-white mb-4 font-['Syne']">Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byStatus} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                  {byStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d0d22", border: "1px solid rgba(255,45,120,0.3)", borderRadius: "12px", color: "#f0efff" }} />
                <Legend formatter={(v) => <span style={{ color: "#9090b8", fontFamily: "Plus Jakarta Sans" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GradBorder>

        <GradBorder>
          <div className="p-5">
            <h3 className="font-bold text-white mb-4 font-['Syne']">By Priority</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byPriority} barSize={36}>
                <XAxis dataKey="name" tick={{ fill: "#9090b8", fontFamily: "Plus Jakarta Sans", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9090b8", fontFamily: "JetBrains Mono", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0d0d22", border: "1px solid rgba(255,45,120,0.3)", borderRadius: "12px", color: "#f0efff" }} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {byPriority.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GradBorder>
      </div>
    </div>
  );
}

// --- ABOUT PAGE ---
export function AboutPage() {
  const stack = [
    { Icon: Globe, name: "React.js", desc: "Component-based UI with hooks, state management, and dynamic rendering", color: "#00d4ff", tag: "Frontend" },
    { Icon: Server, name: "Node.js + Express", desc: "REST API server with route handlers, middleware, and error boundaries", color: "#30d158", tag: "Backend" },
    { Icon: Database, name: "MongoDB + Mongoose", desc: "NoSQL document store with schema validation and indexed queries", color: "#ffb800", tag: "Database" },
    { Icon: Code2, name: "REST API Design", desc: "CRUD endpoints — GET, POST, PUT, DELETE — with proper HTTP status codes", color: "#ff2d78", tag: "API" },
    { Icon: Shield, name: "Form Validation", desc: "Client-side validation with real-time error feedback and edge case handling", color: "#2d6aff", tag: "UX" },
    { Icon: Zap, name: "Dynamic Updates", desc: "Optimistic UI updates without page refresh", color: "#bf5af2", tag: "Performance" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black font-['Syne'] text-white mb-1">Tech Stack</h2>
        <p className="text-sm text-[#9090b8] font-['Plus_Jakarta_Sans']">MERN Stack — MongoDB · Express · React · Node</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stack.map(({ Icon, name, desc, color, tag }) => (
          <div key={name} className="rounded-2xl p-5 transition-all hover:-translate-y-1 duration-300"
            style={{ background: "#0d0d22", border: `1px solid ${color}33` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{tag}</span>
            </div>
            <h4 className="font-bold text-white mb-1.5 font-['Plus_Jakarta_Sans']">{name}</h4>
            <p className="text-xs text-[#9090b8] leading-relaxed font-['Plus_Jakarta_Sans']">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
