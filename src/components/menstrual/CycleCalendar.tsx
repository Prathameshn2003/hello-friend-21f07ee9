import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CycleCalendarProps {
  lastPeriod: string;
  avgCycle: number;
  periodDuration: number;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

type DayStatus = "period" | "predicted" | "ovulation" | "fertile" | "normal";

export function CycleCalendar({ lastPeriod, avgCycle, periodDuration }: CycleCalendarProps) {
  const [yr, setYr] = useState(new Date().getFullYear());
  const [mo, setMo] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const dayStatus = (d: number): DayStatus => {
    if (!lastPeriod) return "normal";
    const dt = new Date(yr, mo, d);
    const lp = new Date(lastPeriod + "T12:00:00");
    for (let c = -1; c < 6; c++) {
      const cs = new Date(lp);
      cs.setDate(cs.getDate() + c * avgCycle);
      const diff = Math.round((dt.getTime() - cs.getTime()) / 86400000);
      if (diff >= 0 && diff < periodDuration) return "period";
      if (diff >= -3 && diff < 0) return "predicted";
      const ovDay = Math.round(avgCycle * 0.46);
      if (diff >= ovDay - 1 && diff <= ovDay + 1) return "fertile";
      if (diff === ovDay) return "ovulation";
    }
    return "normal";
  };

  const getDayInfo = (d: number) => {
    const s = dayStatus(d);
    switch (s) {
      case "period": return { label: "🩸 Period Day", desc: "Active menstruation", color: "text-primary" };
      case "predicted": return { label: "📅 Period Expected", desc: "Your period may start soon", color: "text-primary" };
      case "ovulation": return { label: "🥚 Ovulation Day", desc: "Peak fertility window", color: "text-teal" };
      case "fertile": return { label: "💫 Fertile Window", desc: "Higher chance of conception", color: "text-teal" };
      default: return null;
    }
  };

  const first = new Date(yr, mo, 1).getDay();
  const days = new Date(yr, mo + 1, 0).getDate();
  const today = new Date();

  const prev = () => { let m = mo - 1, y = yr; if (m < 0) { m = 11; y--; } setMo(m); setYr(y); setSelectedDay(null); };
  const next = () => { let m = mo + 1, y = yr; if (m > 11) { m = 0; y++; } setMo(m); setYr(y); setSelectedDay(null); };
  const goToday = () => { setMo(today.getMonth()); setYr(today.getFullYear()); setSelectedDay(today.getDate()); };

  const statusClasses: Record<DayStatus, string> = {
    period: "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/25",
    predicted: "bg-primary/15 text-primary border border-primary/30 font-semibold",
    ovulation: "bg-teal text-teal-foreground font-bold shadow-sm shadow-teal/25",
    fertile: "bg-teal/15 text-teal border border-teal/30 font-medium",
    normal: "text-foreground hover:bg-muted/60",
  };

  // Count stats for this month
  const allStatuses = Array.from({ length: days }, (_, i) => dayStatus(i + 1));
  const periodCount = allStatuses.filter(s => s === "period").length;
  const fertileCount = allStatuses.filter(s => s === "fertile" || s === "ovulation").length;

  const selectedInfo = selectedDay ? getDayInfo(selectedDay) : null;

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5" onClick={prev}>
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <button onClick={goToday} className="text-center group cursor-pointer">
          <span className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {MONTHS[mo]} {yr}
          </span>
          {lastPeriod && (
            <div className="flex gap-3 justify-center mt-0.5">
              {periodCount > 0 && (
                <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {periodCount}d period
                </span>
              )}
              {fertileCount > 0 && (
                <span className="text-[10px] text-teal font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                  {fertileCount}d fertile
                </span>
              )}
            </div>
          )}
        </button>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5" onClick={next}>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d, i) => (
          <div key={`${d}-${i}`} className="text-center text-[11px] font-bold text-muted-foreground/70 uppercase py-1.5">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: first }, (_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1;
          const s = dayStatus(d);
          const isToday = new Date(yr, mo, d).toDateString() === today.toDateString();
          const isSelected = selectedDay === d;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(isSelected ? null : d)}
              className={cn(
                "aspect-square flex items-center justify-center rounded-xl text-sm transition-all duration-200 relative",
                statusClasses[s],
                isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                isSelected && s === "normal" && "bg-muted ring-2 ring-foreground/20",
                "active:scale-95"
              )}
            >
              {d}
              {isToday && s === "normal" && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day info */}
      {selectedInfo && (
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl border animate-fade-up",
          selectedInfo.color === "text-primary" ? "bg-primary/5 border-primary/15" : "bg-teal/5 border-teal/15"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0",
            selectedInfo.color === "text-primary" ? "bg-primary/10" : "bg-teal/10"
          )}>
            {selectedInfo.label.split(" ")[0]}
          </div>
          <div>
            <p className={cn("text-sm font-semibold", selectedInfo.color)}>
              {selectedInfo.label.slice(2)} — Day {selectedDay}
            </p>
            <p className="text-xs text-muted-foreground">{selectedInfo.desc}</p>
          </div>
        </div>
      )}

      {/* No data message */}
      {!lastPeriod && (
        <div className="text-center py-4 rounded-xl bg-muted/30 border border-dashed border-border">
          <CalendarDays className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Complete the assessment to see period & fertility predictions
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center pt-1">
        {[
          { color: "bg-primary", label: "Period" },
          { color: "bg-primary/20 border border-primary/30", label: "Expected" },
          { color: "bg-teal", label: "Ovulation" },
          { color: "bg-teal/20 border border-teal/30", label: "Fertile" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div className={cn("w-2.5 h-2.5 rounded-sm", color)} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}