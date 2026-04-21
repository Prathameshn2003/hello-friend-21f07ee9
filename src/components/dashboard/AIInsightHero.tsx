import { Sun, Moon, Sparkles, Bell, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import logoImg from "@/assets/logo.png";

interface AIInsightHeroProps {
  userName: string;
  greeting: { text: string; icon: typeof Sun };
  aiInsight: string;
  alertText: string | null;
  cyclesLogged: number;
  currentDay: number | null;
}

export const AIInsightHero = ({
  userName,
  greeting,
  aiInsight,
  alertText,
  cyclesLogged,
  currentDay,
}: AIInsightHeroProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl p-5 sm:p-6 md:p-8 bg-gradient-to-br from-primary/15 via-secondary/10 to-teal/15 border border-border/50 shadow-soft"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/25 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-soft" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal/25 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Left: greeting */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="NaariCare" className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl shadow-md object-contain" />
            <span className="font-heading font-bold text-base sm:text-lg text-foreground">
              Naari<span className="text-accent">Care</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <greeting.icon className="w-4 h-4" />
            <span className="text-xs sm:text-sm">{greeting.text}</span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            Welcome back, {userName}! 👋
          </h1>

          {/* AI Insight pill */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-xl bg-background/70 backdrop-blur-sm border border-primary/20 shadow-xs"
          >
            <div className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">AI Insight</p>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">{aiInsight}</p>
            </div>
          </motion.div>

          {/* Alert */}
          {alertText && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-warning/10 border border-warning/30"
            >
              <Bell className="w-4 h-4 text-warning shrink-0" />
              <p className="text-xs sm:text-sm text-foreground">{alertText}</p>
            </motion.div>
          )}
        </div>

        {/* Right: quick stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-2.5 sm:gap-3 content-start">
          <div className="p-3 sm:p-4 rounded-xl bg-background/70 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-xs">Cycles</span>
            </div>
            <div className="font-heading text-xl sm:text-2xl font-bold text-foreground">{cyclesLogged}</div>
            <div className="text-[10px] text-muted-foreground">logged</div>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-background/70 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-xs">Cycle Day</span>
            </div>
            <div className="font-heading text-xl sm:text-2xl font-bold text-foreground">
              {currentDay ?? "—"}
            </div>
            <div className="text-[10px] text-muted-foreground">today</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
