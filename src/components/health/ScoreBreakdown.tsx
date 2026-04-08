import { motion } from "framer-motion";
import { TrendingUp, Info } from "lucide-react";

interface ScoreBreakdownItem {
  name: string;
  score: number;
  maxScore: number;
  description: string;
}

interface ScoreBreakdownProps {
  title: string;
  items: ScoreBreakdownItem[];
  showTrend?: boolean;
}

const getBarColor = (percentage: number) => {
  if (percentage > 66) return 'bg-destructive';
  if (percentage > 33) return 'bg-accent';
  return 'bg-teal';
};

const getLabel = (percentage: number) => {
  if (percentage > 66) return { text: 'High', color: 'text-destructive', emoji: '🔴' };
  if (percentage > 33) return { text: 'Moderate', color: 'text-accent', emoji: '🟠' };
  return { text: 'Low', color: 'text-teal', emoji: '🟢' };
};

export const ScoreBreakdown = ({ title, items, showTrend }: ScoreBreakdownProps) => {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-4">
      <h3 className="font-heading text-sm sm:text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
        {showTrend && <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />}
        {title}
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {items.map((item, index) => {
          const percentage = item.maxScore > 0 ? (item.score / item.maxScore) * 100 : 0;
          const label = getLabel(percentage);
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1.5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm">{label.emoji}</span>
                  <span className="font-medium text-xs sm:text-sm text-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] sm:text-xs font-semibold ${label.color}`}>{label.text}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">{item.score}/{item.maxScore}</span>
                </div>
              </div>
              <div className="h-2 sm:h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getBarColor(percentage)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, percentage)}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
              <div className="flex items-start gap-1">
                <Info className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
