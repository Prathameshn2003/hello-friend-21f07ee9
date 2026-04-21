import { Link } from "react-router-dom";
import { ChevronRight, Sparkles, Calendar, TrendingUp, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export interface HealthCard {
  title: string;
  status: string | null;
  statusColor: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  path: string;
  hasData: boolean;
  predictedDate: string | null;
  daysUntil: number | null;
  metric: string | null;
  metricLabel: string | null;
}

// Map card title → gauge gradient theme
const getTheme = (title: string) => {
  if (title.includes("Menstrual")) {
    return {
      gauge: ["hsl(168 60% 55%)", "hsl(168 50% 70%)", "hsl(142 60% 75%)"],
      ring: "from-teal/20 via-teal/10 to-success/20",
      accent: "text-teal",
      pillBg: "bg-teal/10",
      pillBorder: "border-teal/20",
    };
  }
  if (title.includes("PCOS")) {
    return {
      gauge: ["hsl(0 84% 65%)", "hsl(14 100% 65%)", "hsl(38 92% 60%)"],
      ring: "from-destructive/20 via-accent/15 to-warning/20",
      accent: "text-accent",
      pillBg: "bg-accent/10",
      pillBorder: "border-accent/20",
    };
  }
  return {
    gauge: ["hsl(340 75% 65%)", "hsl(290 50% 70%)", "hsl(230 60% 78%)"],
    ring: "from-primary/20 via-secondary/15 to-secondary/25",
    accent: "text-primary",
    pillBg: "bg-primary/10",
    pillBorder: "border-primary/20",
  };
};

// Parse metric string like "34%" → number 34. Fallback to 50 when N/A.
const parsePercent = (m: string | null): number => {
  if (!m) return 0;
  const n = parseInt(m.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? 0 : Math.min(100, Math.max(0, n));
};

interface GaugeProps {
  value: number;
  colors: string[];
  centerLabel: string;
  subLabel?: string | null;
}

const Gauge = ({ value, colors, centerLabel, subLabel }: GaugeProps) => {
  // Semi-circle gauge: 180° arc, needle position based on value
  const angle = -90 + (value / 100) * 180; // -90 (left) → +90 (right)
  const id = `g-${colors[0].replace(/[^a-z0-9]/gi, "")}`;

  return (
    <div className="relative w-full flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="50%" stopColor={colors[1]} />
            <stop offset="100%" stopColor={colors[2]} />
          </linearGradient>
        </defs>
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.3"
        />
        {/* Colored gradient arc */}
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="14"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {/* Tick marks */}
        {[...Array(11)].map((_, i) => {
          const a = (-90 + i * 18) * (Math.PI / 180);
          const x1 = 100 + Math.cos(a) * 70;
          const y1 = 100 + Math.sin(a) * 70;
          const x2 = 100 + Math.cos(a) * 62;
          const y2 = 100 + Math.sin(a) * 62;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1.5" opacity="0.7" />;
        })}
        {/* Needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transformOrigin: "100px 100px" }}
        >
          <line x1="100" y1="100" x2="100" y2="35" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="100,30 96,40 104,40" fill="hsl(var(--foreground))" />
          <circle cx="100" cy="100" r="6" fill="hsl(var(--foreground))" />
          <circle cx="100" cy="100" r="3" fill="white" />
        </motion.g>
      </svg>
      <div className="absolute inset-x-0 top-[55%] flex flex-col items-center pointer-events-none">
        <div className="text-2xl sm:text-[26px] font-bold font-heading text-foreground leading-none">{centerLabel}</div>
        {subLabel && <div className="text-[10px] font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{subLabel}</div>}
      </div>
    </div>
  );
};

export const HealthOverviewCards = ({ cards }: Props) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground">📊 Health Overview</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => {
          const theme = getTheme(card.title);
          const pct = parsePercent(card.metric);
          // Default gauge values when no metric
          const gaugeValue = card.hasData
            ? (card.metric ? pct : (card.title.includes("Menstrual") ? 75 : 30))
            : 0;
          const centerText = card.metric || (card.hasData ? (card.title.includes("Menstrual") ? "✓" : "—") : "?");
          const subText = card.metricLabel || (card.hasData ? card.status?.replace(/[🟢🟠🔴]/g, "").trim() : "No data");

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Link
                to={card.path}
                className="group block rounded-3xl overflow-hidden bg-card border border-border/60 hover:border-primary/40 hover:shadow-xl transition-all duration-300 h-full"
              >
                {/* Top: title + chevron */}
                <div className="flex items-center justify-between px-5 pt-5 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                      <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                    </div>
                    <h3 className="font-heading text-sm sm:text-base font-bold text-foreground">{card.title}</h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>

                {/* Gauge area with soft gradient bg */}
                <div className={`relative px-4 pt-2 pb-4 bg-gradient-to-b ${theme.ring}`}>
                  <Gauge
                    value={gaugeValue}
                    colors={theme.gauge}
                    centerLabel={centerText}
                    subLabel={subText}
                  />
                </div>

                {/* Bottom info panel */}
                <div className="px-5 py-4 space-y-3 bg-card">
                  {card.hasData ? (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {card.predictedDate ? "Status" : "Result"}
                        </span>
                        <span className={`text-sm font-bold ${card.statusColor}`}>{card.status || "—"}</span>
                      </div>

                      {card.predictedDate ? (
                        <div className={`flex items-center justify-between p-3 rounded-xl ${theme.pillBg} border ${theme.pillBorder}`}>
                          <div className="flex items-center gap-2">
                            <Calendar className={`w-4 h-4 ${theme.accent}`} />
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Next Period</div>
                              <div className="text-sm font-bold text-foreground">{card.predictedDate}</div>
                            </div>
                          </div>
                          {card.daysUntil != null && card.daysUntil > 0 && (
                            <div className="text-right">
                              <div className={`text-lg font-bold ${theme.accent}`}>{card.daysUntil}</div>
                              <div className="text-[9px] uppercase text-muted-foreground font-semibold">days</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`flex items-center gap-2 p-3 rounded-xl ${theme.pillBg} border ${theme.pillBorder}`}>
                          <TrendingUp className={`w-4 h-4 ${theme.accent}`} />
                          <span className="text-xs font-medium text-foreground">
                            {card.title.includes("PCOS") ? "Focus on diet & exercise" : "Track regularly for insights"}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/60">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-foreground">Start Assessment →</span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

interface Props {
  cards: HealthCard[];
}
