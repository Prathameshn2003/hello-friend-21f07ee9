import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number;
  label: string;
  color: string;
}

export const RiskGauge = ({ score, label, color }: RiskGaugeProps) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getEmoji = () => {
    if (clampedScore < 30) return "💚";
    if (clampedScore < 60) return "🧡";
    return "❤️";
  };

  const getMessage = () => {
    if (clampedScore < 30) return "Looking good!";
    if (clampedScore < 60) return "Needs attention";
    return "Consult a doctor";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="7" opacity="0.3" />
          <motion.circle
            cx="50" cy="50" r="45" fill="none"
            stroke="currentColor"
            className={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl sm:text-3xl font-bold text-foreground"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {Math.round(clampedScore)}%
          </motion.span>
          <span className="text-[10px] sm:text-xs text-muted-foreground">{label}</span>
        </div>
      </div>
      <motion.div 
        className="mt-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="text-sm">{getEmoji()} {getMessage()}</span>
      </motion.div>
    </div>
  );
};
