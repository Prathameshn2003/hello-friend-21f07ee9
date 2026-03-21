import { getPhaseInfo } from "@/lib/menstrual-ml";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PhaseRingProps {
  dayInCycle: number;
  avgCycle: number;
}

export function PhaseRing({ dayInCycle, avgCycle }: PhaseRingProps) {
  const pct = Math.min(1, Math.max(0, dayInCycle / avgCycle));
  const r = 62, cx = 75, cy = 75;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const phase = getPhaseInfo(dayInCycle, avgCycle);

  const phases = [
    { name: "Menstruation", pct: 0.18, color: "hsl(var(--primary))", emoji: "🩸" },
    { name: "Follicular", pct: 0.28, color: "hsl(var(--teal))", emoji: "🌱" },
    { name: "Ovulation", pct: 0.10, color: "#2D7A5E", emoji: "🥚" },
    { name: "Luteal", pct: 0.44, color: "hsl(var(--accent))", emoji: "🌙" },
  ];

  const daysLeft = Math.max(0, avgCycle - dayInCycle);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Ring */}
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 150 150" className="w-full h-full">
          {/* Background track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="7" opacity="0.25" />
          
          {/* Phase segments (outer decorative) */}
          {(() => {
            let offset = 0;
            return phases.map((p, i) => {
              const segDash = p.pct * circ;
              const el = (
                <circle
                  key={i}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={p.color}
                  strokeWidth="7"
                  strokeDasharray={`${segDash} ${circ - segDash}`}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${cx} ${cy})`}
                  opacity="0.15"
                />
              );
              offset += segDash;
              return el;
            });
          })()}

          {/* Active progress */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={phase.color}
            strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            className="transition-all duration-1000 ease-out"
          />

          {/* Current position dot */}
          {(() => {
            const angle = (pct * 360 - 90) * (Math.PI / 180);
            const dotX = cx + r * Math.cos(angle);
            const dotY = cy + r * Math.sin(angle);
            return (
              <>
                <circle cx={dotX} cy={dotY} r="5.5" fill={phase.color} className="transition-all duration-700" />
                <circle cx={dotX} cy={dotY} r="2.5" fill="white" className="transition-all duration-700" />
              </>
            );
          })()}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-3xl font-bold text-foreground leading-none">
            {Math.max(0, dayInCycle)}
          </span>
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
            day
          </span>
        </div>
      </div>

      {/* Phase badge */}
      <Badge 
        variant="secondary" 
        className={cn(
          "text-sm px-5 py-2 font-semibold shadow-sm border",
          phase.bg, "text-foreground"
        )}
      >
        {phase.name} Phase
      </Badge>

      {/* Days left info */}
      <p className="text-xs text-muted-foreground text-center">
        {daysLeft > 0 
          ? `~${daysLeft} days until next period`
          : "Your period may have started"
        }
      </p>

      {/* Phase tips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-xs">
        {phase.tips.map((t, i) => (
          <span 
            key={i} 
            className="text-[11px] px-3 py-1.5 rounded-full bg-muted/60 text-foreground font-medium border border-border/50"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Phase legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full max-w-xs">
        {phases.map(p => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-[11px] text-muted-foreground flex-1">{p.emoji} {p.name}</span>
            <span className="text-[10px] text-muted-foreground/50 font-medium">{Math.round(p.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}