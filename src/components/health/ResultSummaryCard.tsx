import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ResultSummaryCardProps {
  title: string;
  status: 'positive' | 'neutral' | 'negative';
  icon: ReactNode;
  description: string;
  details: string[];
}

export const ResultSummaryCard = ({ title, status, icon, description, details }: ResultSummaryCardProps) => {
  const statusColors = {
    positive: 'border-primary/30 bg-primary/5',
    neutral: 'border-accent/30 bg-accent/5',
    negative: 'border-destructive/30 bg-destructive/5',
  };

  const iconColors = {
    positive: 'text-primary',
    neutral: 'text-accent',
    negative: 'text-destructive',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 p-4 sm:p-6 ${statusColors[status]}`}
    >
      <div className="flex items-start gap-4">
        <div className={`shrink-0 ${iconColors[status]}`}>{icon}</div>
        <div className="space-y-2">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
          <ul className="space-y-1">
            {details.map((detail, i) => (
              <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
