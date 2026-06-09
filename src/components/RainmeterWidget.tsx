import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useContestStore } from "../stores/useContestStore";
import { formatTimeRemaining } from "../utils/time";

export function RainmeterWidget() {
  const { contests, fetchContests, isLoading } = useContestStore();

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const upcoming = contests.length > 0 ? contests[0] : null;

  const openMainApp = () => {
    invoke("open_main_app");
  };

  if (isLoading && !upcoming) {
    return (
      <div 
        data-tauri-drag-region
        className="w-full h-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      data-tauri-drag-region
      onClick={openMainApp}
      className="w-full h-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex flex-col justify-center px-4 cursor-pointer hover:bg-black/50 hover:border-white/20 transition-all shadow-xl group"
    >
      {upcoming ? (
        <>
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
              {upcoming.platform}
            </span>
            <span className="text-[10px] font-mono font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
              {formatTimeRemaining(upcoming.startTime)}
            </span>
          </div>
          <h3 className="text-xs font-medium text-white/90 mt-1 truncate pointer-events-none group-hover:text-white">
            {upcoming.name}
          </h3>
        </>
      ) : (
        <div className="text-xs text-white/50 text-center pointer-events-none">
          No upcoming contests
        </div>
      )}
    </div>
  );
}
