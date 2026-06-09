import { useContestStore } from "../stores/useContestStore";
import { ContestCard } from "./ContestCard";

export function WidgetView() {
  const { contests } = useContestStore();

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest px-1">
        Up Next
      </h2>
      <div className="flex flex-col gap-3">
        {contests.map((contest) => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
      </div>
    </div>
  );
}
