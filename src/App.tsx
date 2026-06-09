import { useEffect, useState } from "react";
import { Calendar, Settings, Trophy, RefreshCw, LayoutGrid, X } from "lucide-react";
import { WidgetView } from "./components/WidgetView";
import { CalendarView } from "./components/CalendarView";
import { RainmeterWidget } from "./components/RainmeterWidget";
import { useContestStore } from "./stores/useContestStore";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./App.css";

function App() {
  const [view, setView] = useState<"widget" | "calendar" | "settings">("widget");
  const [windowLabel, setWindowLabel] = useState<string | null>(null);
  const { fetchContests, isLoading } = useContestStore();

  useEffect(() => {
    // Determine which window we are rendering
    const init = async () => {
      try {
        const appWindow = getCurrentWindow();
        setWindowLabel(appWindow.label);
      } catch (e) {
        // Fallback for browser testing
        setWindowLabel("main");
      }
    };
    init();
    fetchContests();
  }, [fetchContests]);

  if (windowLabel === "widget") {
    return <RainmeterWidget />;
  }

  if (windowLabel === null) {
    return null; // Wait for window label to be determined
  }

  // The rest is the Main App window
  return (
    <div className="h-screen w-screen bg-transparent p-3 flex flex-col gap-4 dark text-foreground">
      {/* Main Glass Panel */}
      <div className="glass-panel flex-1 flex flex-col overflow-hidden relative border border-white/5 bg-[#1a1a1a]/80">
        {/* Header */}
        <header 
          data-tauri-drag-region 
          className="h-12 border-b border-white/5 flex items-center justify-between px-3 bg-white/[0.02] cursor-grab active:cursor-grabbing shrink-0"
        >
          <div className="flex items-center gap-2 font-medium tracking-tight pointer-events-none">
            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
              <Trophy className="w-3 h-3 text-white/80" />
            </div>
            <span className="text-sm text-white/90">CP Companion</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchContests()}
              className={`p-1.5 text-white/40 hover:text-white/90 transition-colors rounded-md hover:bg-white/5 ${isLoading ? 'animate-spin text-white/90' : ''}`}
              title="Refresh Contests"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView(view === "widget" ? "calendar" : "widget")}
              className={`p-1.5 transition-colors rounded-md hover:bg-white/5 ${view === 'calendar' ? 'text-white/90 bg-white/10' : 'text-white/40 hover:text-white/90'}`}
              title={view === "widget" ? "Calendar View" : "List View"}
            >
              {view === "widget" ? <Calendar className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
            </button>
            <button 
              onClick={() => setView(view === "settings" ? "widget" : "settings")}
              className={`p-1.5 transition-colors rounded-md hover:bg-white/5 ${view === 'settings' ? 'text-white/90 bg-white/10' : 'text-white/40 hover:text-white/90'}`}
              title="Settings"
            >
              {view === "settings" ? <X className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
          {view === "widget" && <div className="p-3"><WidgetView /></div>}
          {view === "calendar" && <CalendarView />}
          {view === "settings" && (
            <div className="p-4 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-white/90">Settings</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/50 mb-4">
                  Note: API Credentials have been hardcoded into the backend as requested, but this form allows future overrides.
                </p>
                <label className="text-xs text-white/60 block mb-1">Clist Username</label>
                <input type="text" defaultValue="Eigenform" className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm text-white focus:border-blue-500 outline-none transition-colors" placeholder="e.g. tournist" />
                
                <label className="text-xs text-white/60 block mt-4 mb-1">Clist API Key</label>
                <input type="password" defaultValue="a2743998f53694146f4314c79190b7b441118caa" className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm text-white focus:border-blue-500 outline-none transition-colors" placeholder="Enter API Key" />
                
                <button className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white text-sm py-2 rounded transition-colors">
                  Save Configuration
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
