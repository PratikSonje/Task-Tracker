import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { Check, Home, ClipboardList, BarChart3, LogOut, Menu, X } from "lucide-react";
import { Page, Task } from "../types";
import { api, getToken, removeToken } from "./api";
import { HomePage, TasksPage, AnalyticsPage } from "../features/tasks/dashboard";
import LandingPage from "./landing-page";
import AuthScreen from "../features/auth/auth-screen";

function Sidebar({ page, setPage, onLogout, isOpen, setIsOpen }: { page: Page; setPage: (p: Page) => void; onLogout: () => void; isOpen: boolean; setIsOpen: (o: boolean) => void }) {
  const nav = [
    { id: "home" as Page, Icon: Home, label: "Home" },
    { id: "tasks" as Page, Icon: ClipboardList, label: "Tasks" },
    { id: "analytics" as Page, Icon: BarChart3, label: "Analytics" }
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed left-0 top-0 h-full w-64 lg:w-56 flex flex-col z-40 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ background: "linear-gradient(180deg, #0a0a1e 0%, #060612 100%)", borderRight: "1px solid rgba(255,45,120,0.15)" }}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #ff2d78, #2d6aff)", boxShadow: "0 0 20px rgba(255,45,120,0.4)" }}>
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <span className="font-black text-white font-['Syne'] text-lg">TaskTrack</span>
          </div>
          <button className="lg:hidden text-[#9090b8]" onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex flex-col gap-1 p-2 mt-2 flex-1">
          {nav.map(({ id, Icon, label }) => {
            const active = page === id;
            return (
              <button key={id} onClick={() => { setPage(id); setIsOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden"
                style={active ? { background: "linear-gradient(135deg, rgba(255,45,120,0.2), rgba(45,106,255,0.15))", borderLeft: "2px solid #ff2d78" } : {}}>
                {active && <div className="absolute inset-0 bg-gradient-to-r from-[#ff2d78]/5 to-[#2d6aff]/5" />}
                <Icon className="w-5 h-5 shrink-0 relative z-10 transition-colors"
                  style={{ color: active ? "#ff2d78" : "#9090b8" }} />
                <span className="text-sm font-medium relative z-10 font-['Plus_Jakarta_Sans']"
                  style={{ color: active ? "#f0efff" : "#9090b8" }}>{label}</span>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-[#ff2d78] ml-auto relative z-10" />}
              </button>
            );
          })}
        </nav>

        <div className="p-2">
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5 group">
            <LogOut className="w-5 h-5 text-[#9090b8] group-hover:text-[#ff3b55] transition-colors shrink-0" />
            <span className="text-sm font-medium text-[#9090b8] group-hover:text-white transition-colors font-['Plus_Jakarta_Sans']">
              Log Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getToken());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setPage("home");
      api.getTasks().then(setTasks).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
    setTasks([]);
    setPage("landing");
  };

  if (!isAuthenticated && page === "landing") {
    return <LandingPage setPage={setPage} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen setPage={setPage} onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#060612] font-['Plus_Jakarta_Sans']" style={{ scrollbarWidth: "none" }}>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#ff2d78]/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#2d6aff]/8 blur-[120px]" />
      </div>

      <Sidebar page={page} setPage={setPage} onLogout={handleLogout} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="w-full lg:pl-56 min-h-screen flex justify-center">
        <div className="w-full max-w-7xl px-5 sm:px-8 py-8 relative z-10">
          <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 text-white transition-colors" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <p className="text-xs font-mono text-[#9090b8] mb-0.5">
                {{ home: "Overview", tasks: "Task Manager", analytics: "Data Insights" }[page as string] || ""}
              </p>
              <h1 className="text-xl font-black font-['Syne'] text-white">
                {{ home: "Dashboard", tasks: "All Tasks", analytics: "Analytics" }[page as string] || ""}
              </h1>
            </div>
          </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" title="API connected" />
              <span className="text-xs font-mono text-[#9090b8] hidden sm:inline">Connected</span>
            </div>
          </div>

          {page === "home" && <HomePage tasks={tasks} setTasks={setTasks} setPage={setPage} />}
          {page === "tasks" && <TasksPage tasks={tasks} setTasks={setTasks} />}
          {page === "analytics" && <AnalyticsPage tasks={tasks} />}
        </div>
      </main>
    </div>
  );
}
