import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface Props {
  score: number; // 0-100
}

export const HealthScoreRing = ({ score }: Props) => {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const ringColor =
    clamped >= 75 ? "hsl(var(--success))" : clamped >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  const label = clamped >= 75 ? "Excellent" : clamped >= 50 ? "Good" : clamped >= 30 ? "Fair" : "Needs Care";
  const message =
    clamped >= 75
      ? "You're doing great! Keep up the healthy habits."
      : clamped >= 50
      ? "Steady progress. Small improvements help."
      : "Time to focus on self-care and wellness.";

  return (
    <Card className="border-border/60 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg font-heading flex items-center gap-2">
          <Heart className="w-4 h-4 text-accent" />
          Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-2 pb-5">
        <div className="relative w-36 h-36 sm:w-40 sm:h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="10"
            />
            <motion.circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-3xl sm:text-4xl font-bold text-foreground">{clamped}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">/ 100</span>
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="font-semibold text-sm text-foreground">{label}</div>
          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
};
