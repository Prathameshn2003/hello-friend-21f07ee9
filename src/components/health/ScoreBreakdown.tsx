import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

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

export const ScoreBreakdown = ({ title, items, showTrend }: ScoreBreakdownProps) => {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-4">
      <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
        {showTrend && <TrendingUp className="w-5 h-5 text-accent" />}
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item, index) => {
          const percentage = item.maxScore > 0 ? (item.score / item.maxScore) * 100 : 0;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1"
            >
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="text-muted-foreground">{item.score}/{item.maxScore}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${percentage > 66 ? 'bg-destructive' : percentage > 33 ? 'bg-accent' : 'bg-primary'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, percentage)}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
