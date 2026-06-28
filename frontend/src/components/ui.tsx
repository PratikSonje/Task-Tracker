import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Circle, PlayCircle, MoreHorizontal, Edit3, Trash2, Calendar, AlertTriangle, Loader2, X } from "lucide-react";
import { Priority, Status, Task, TaskFormData } from "../types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const STATUS_CFG = {
  todo: { label: "To Do", color: "#9090b8", border: "#9090b8", Icon: Circle },
  "in-progress": { label: "In Progress", color: "#2d6aff", border: "#2d6aff", Icon: PlayCircle },
  done: { label: "Done", color: "#30d158", border: "#30d158", Icon: CheckCircle2 },
} as const;

export const PRIORITY_CFG = {
  high: { label: "High", bg: "rgba(255,45,120,0.12)", text: "#ff2d78", dot: "#ff2d78" },
  medium: { label: "Medium", bg: "rgba(255,184,0,0.12)", text: "#ffb800", dot: "#ffb800" },
  low: { label: "Low", bg: "rgba(45,106,255,0.12)", text: "#7aa4ff", dot: "#2d6aff" },
} as const;

export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function isOverdue(t: Task) { 
  return !!t.dueDate && t.status !== "done" && t.dueDate.split("T")[0] < new Date().toISOString().split("T")[0]; 
}

export function formatRelative(iso: string | null) {
  if (!iso) return "";
  const today = new Date().toISOString().split("T")[0];
  if (iso === today) return "Today";
  const diff = Math.round((new Date(iso + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000);
  if (diff === 1) return "Tomorrow"; if (diff === -1) return "Yesterday";
  if (diff > 0 && diff < 7) return `${diff}d left`;
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function GradBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ padding: "1px", borderRadius: "1rem", background: "linear-gradient(135deg, rgba(255,45,120,0.5), rgba(45,106,255,0.5))" }}>
      <div className="bg-[#0d0d22] rounded-[calc(1rem-1px)] h-full">{children}</div>
    </div>
  );
}

export function StatCard3D({ label, value, sub, color = "#ff2d78" }: { label: string; value: number | string; sub?: string; color?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-2xl p-5 cursor-default transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, #0d0d22, #131330)",
        border: `1px solid ${color}33`,
        boxShadow: hovered ? `0 0 40px ${color}25` : "none",
        transform: hovered ? "translateY(-4px) scale(1.02)" : "none",
      }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30" style={{ background: color, transform: "translate(30%, -30%)" }} />
      <p className="text-xs font-medium uppercase tracking-widest mb-2 font-['Plus_Jakarta_Sans']" style={{ color: "#9090b8" }}>{label}</p>
      <p className="text-4xl font-black font-['Syne']" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-1 font-['Plus_Jakarta_Sans']" style={{ color: "#9090b8" }}>{sub}</p>}
    </div>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const c = PRIORITY_CFG[priority];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-['Plus_Jakarta_Sans']"
      style={{ background: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

export function TagChip({ tag }: { tag: string }) {
  return (
    <span className="px-2 py-0.5 rounded text-[11px] font-mono"
      style={{ background: "rgba(45,106,255,0.12)", color: "#7aa4ff", border: "1px solid rgba(45,106,255,0.2)" }}>
      {tag}
    </span>
  );
}

export function DropMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="absolute right-0 top-8 z-30 w-36 rounded-xl overflow-hidden"
      style={{ background: "#0d0d22", border: "1px solid rgba(255,45,120,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
      <button onClick={onEdit} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left font-['Plus_Jakarta_Sans']">
        <Edit3 className="w-3.5 h-3.5 text-[#2d6aff]" /> Edit
      </button>
      <button onClick={onDelete} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/10 transition-colors text-left font-['Plus_Jakarta_Sans']" style={{ color: "#ff3b55" }}>
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    </div>
  );
}

export function TaskCard({ task, view, onEdit, onDelete, onStatusChange }: {
  task: Task; view: "grid" | "list";
  onEdit: (t: Task) => void; onDelete: (t: Task) => void;
  onStatusChange: (t: Task, s: Status) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const overdue = isOverdue(task);
  const nextStatus: Record<Status, Status> = { todo: "in-progress", "in-progress": "done", done: "todo" };
  const scfg = STATUS_CFG[task.status];

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  if (view === "list") {
    return (
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200"
        style={{
          background: hovered ? "rgba(255,45,120,0.05)" : "rgba(13,13,34,0.7)",
          border: `1px solid ${hovered ? "rgba(255,45,120,0.3)" : "rgba(255,255,255,0.06)"}`,
          borderLeft: `3px solid ${scfg.border}`,
        }}>
        <button onClick={() => onStatusChange(task, nextStatus[task.status])} className="shrink-0">
          <scfg.Icon className="w-5 h-5 transition-transform hover:scale-110" style={{ color: scfg.color }} />
        </button>
        <span className={`flex-1 text-sm font-medium font-['Plus_Jakarta_Sans'] ${task.status === "done" ? "line-through opacity-50 text-[#9090b8]" : "text-white"}`}>
          {task.title}
        </span>
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span className="text-xs font-mono flex items-center gap-1" style={{ color: overdue ? "#ff2d78" : "#9090b8" }}>
              {overdue && <AlertTriangle className="w-3 h-3" />}{formatRelative(task.dueDate)}
            </span>
          )}
        </div>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <MoreHorizontal className="w-4 h-4 text-[#9090b8]" />
          </button>
          {menuOpen && <DropMenu onEdit={() => { onEdit(task); setMenuOpen(false); }} onDelete={() => { onDelete(task); setMenuOpen(false); }} />}
        </div>
      </div>
    );
  }

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="relative p-4 flex flex-col gap-3 transition-all duration-300 cursor-default"
      style={{
        transform: hovered ? "translateY(-3px)" : "none",
      }}>
      <div className="absolute inset-0 rounded-2xl transition-all duration-300 overflow-hidden" 
        style={{
          background: "linear-gradient(135deg, #0d0d22, #0f0f28)",
          border: `1px solid ${hovered ? scfg.border + "66" : "rgba(255,255,255,0.07)"}`,
          borderLeft: `3px solid ${scfg.border}`,
          boxShadow: hovered ? `0 8px 40px ${scfg.border}22, 0 0 0 1px ${scfg.border}22` : "none",
          zIndex: -1
        }}>
        {hovered && <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${scfg.border}10, transparent 60%)` }} />}
      </div>
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => onStatusChange(task, nextStatus[task.status])} className="mt-0.5 shrink-0 hover:scale-110 transition-transform">
          <scfg.Icon className="w-5 h-5" style={{ color: scfg.color }} />
        </button>
        <h3 className={`flex-1 text-sm font-semibold leading-snug font-['Plus_Jakarta_Sans'] ${task.status === "done" ? "line-through opacity-50 text-[#9090b8]" : "text-white"}`}>
          {task.title}
        </h3>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(o => !o)}
            className="p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            style={{ opacity: hovered ? 1 : 0 }}>
            <MoreHorizontal className="w-4 h-4 text-[#9090b8]" />
          </button>
          {menuOpen && <DropMenu onEdit={() => { onEdit(task); setMenuOpen(false); }} onDelete={() => { onDelete(task); setMenuOpen(false); }} />}
        </div>
      </div>
      {task.description && <p className="text-xs text-[#9090b8] leading-relaxed line-clamp-2 font-['Plus_Jakarta_Sans']">{task.description}</p>}
      {task.tags.length > 0 && <div className="flex flex-wrap gap-1">{task.tags.slice(0, 3).map(t => <TagChip key={t} tag={t} />)}</div>}
      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <PriorityBadge priority={task.priority} />
        <span className="text-xs font-mono flex items-center gap-1" style={{ color: overdue ? "#ff2d78" : "#9090b8" }}>
          {task.dueDate ? (
            <><Calendar className="w-3 h-3" />{formatRelative(task.dueDate)}</>
          ) : <span className="opacity-50">No date</span>}
        </span>
      </div>
    </div>
  );
}

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskModal({ task, onSave, onClose, saving }: { task: Task | null; onSave: (d: TaskFormData) => void; onClose: () => void; saving: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? {
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : "",
      tags: task.tags ? task.tags.join(", ") : ""
    } : {
      title: "", description: "", status: "todo", priority: "medium", dueDate: "", tags: ""
    }
  });

  const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#9090b8] focus:outline-none transition-all duration-200 font-['Plus_Jakarta_Sans']";
  const inputStyle = { background: "#13132b", border: "1px solid rgba(255,255,255,0.08)" };
  const inputFocusStyle = "focus:border-[#ff2d78]/50 focus:ring-2 focus:ring-[#ff2d78]/10";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "linear-gradient(135deg, #0d0d22 0%, #10102a 100%)", border: "1px solid rgba(255,45,120,0.3)", boxShadow: "0 0 80px rgba(255,45,120,0.15), 0 0 120px rgba(45,106,255,0.1)" }}>
        <div className="h-0.5 rounded-t-2xl" style={{ background: "linear-gradient(90deg, #ff2d78, #2d6aff)" }} />
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-black font-['Syne'] text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #ff2d78, #2d6aff)" }}>
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-[#9090b8]" />
          </button>
        </div>
        <form onSubmit={handleSubmit(data => onSave(data as TaskFormData))} className="flex flex-col gap-4 px-6 pb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70 font-['Plus_Jakarta_Sans']">Title *</label>
            <input {...register("title")} autoFocus
              placeholder="What needs to be done?" className={`${inputCls} ${inputFocusStyle}`} style={{ ...inputStyle, ...(errors.title ? { borderColor: "#ff3b55" } : {}) }} />
            {errors.title && <span className="text-xs flex items-center gap-1" style={{ color: "#ff3b55" }}><AlertTriangle className="w-3 h-3" />{errors.title.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70 font-['Plus_Jakarta_Sans']">Description</label>
            <textarea {...register("description")}
              placeholder="Add context..." rows={3} className={`${inputCls} ${inputFocusStyle} resize-none`} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Status", key: "status" as const, opts: [["todo", "To Do"], ["in-progress", "In Progress"], ["done", "Done"]] },
              { label: "Priority", key: "priority" as const, opts: [["high", "High"], ["medium", "Medium"], ["low", "Low"]] },
            ].map(({ label, key, opts }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70 font-['Plus_Jakarta_Sans']">{label}</label>
                <select {...register(key)} className={`${inputCls} cursor-pointer`} style={inputStyle}>
                  {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70 font-['Plus_Jakarta_Sans']">Due Date</label>
            <input type="date" {...register("dueDate")}
              className={`${inputCls} ${inputFocusStyle}`} style={{ ...inputStyle, colorScheme: "dark", ...(errors.dueDate ? { borderColor: "#ff3b55" } : {}) }} />
            {errors.dueDate && <span className="text-xs flex items-center gap-1" style={{ color: "#ff3b55" }}><AlertTriangle className="w-3 h-3" />{errors.dueDate.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70 font-['Plus_Jakarta_Sans']">Tags (comma separated)</label>
            <input {...register("tags")} placeholder="frontend, api"
              className={`${inputCls} ${inputFocusStyle}`} style={inputStyle} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:bg-white/10 font-['Plus_Jakarta_Sans']"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#9090b8" }}>Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 font-['Plus_Jakarta_Sans']"
              style={{ background: "linear-gradient(135deg, #ff2d78, #2d6aff)", boxShadow: "0 0 20px rgba(255,45,120,0.3)" }}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {task ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteConfirm({ task, onConfirm, onClose, deleting }: { task: Task; onConfirm: () => void; onClose: () => void; deleting: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl p-6" style={{ background: "#0d0d22", border: "1px solid rgba(255,59,85,0.4)", boxShadow: "0 0 60px rgba(255,59,85,0.15)" }}>
        <div className="h-0.5 rounded-t absolute top-0 left-0 right-0" style={{ background: "linear-gradient(90deg, #ff3b55, #ff2d78)" }} />
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,59,85,0.15)" }}>
          <Trash2 className="w-6 h-6 text-[#ff3b55]" />
        </div>
        <h3 className="font-bold text-white mb-2 font-['Syne']">Delete Task?</h3>
        <p className="text-sm text-[#9090b8] mb-5 font-['Plus_Jakarta_Sans']">
          <strong className="text-white">"{task.title}"</strong> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-[#9090b8] hover:bg-white/10 transition-colors font-['Plus_Jakarta_Sans']"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60 font-['Plus_Jakarta_Sans']"
            style={{ background: "linear-gradient(135deg, #ff3b55, #ff2d78)" }}>
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
          </button>
        </div>
      </div>
    </div>
  );
}
