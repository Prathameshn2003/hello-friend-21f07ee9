import { ReactNode } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface ResultSummaryCardProps {
  title: string;
  status: 'positive' | 'neutral' | 'negative';
  icon: ReactNode;
  description: string;
  details: string[];
}

export const ResultSummaryCard = ({ title, status, icon, description, details }: ResultSummaryCardProps) => {
  const statusColors = {
    positive: 'border-teal/30 bg-gradient-to-br from-teal/5 to-teal/10',
    neutral: 'border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10',
    negative: 'border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10',
  };

  const iconColors = {
    positive: 'text-teal',
    neutral: 'text-accent',
    negative: 'text-destructive',
  };

  const badgeColors = {
    positive: 'bg-teal/15 text-teal',
    neutral: 'bg-accent/15 text-accent',
    negative: 'bg-destructive/15 text-destructive',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 p-4 sm:p-6 ${statusColors[status]}`}
    >
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className={`shrink-0 p-2 sm:p-3 rounded-xl ${badgeColors[status].split(' ')[0]}`}>
          <div className={iconColors[status]}>{icon}</div>
        </div>
        <div className="space-y-2 sm:space-y-3 flex-1">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{description}</p>
          <ul className="space-y-1.5">
            {details.map((detail, i) => (
              <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${iconColors[status]}`} />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
