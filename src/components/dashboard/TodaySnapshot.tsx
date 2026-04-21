import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Lightbulb, Brain } from "lucide-react";
import { motion } from "framer-motion";

export interface SnapshotItem {
  label: string;
  value: string;
  status: "good" | "warn" | "tip";
}

interface Props {
  items: SnapshotItem[];
  suggestion: string;
}

const statusConfig = {
  good: { Icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  warn: { Icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
  tip: { Icon: Lightbulb, color: "text-primary", bg: "bg-primary/10" },
};

export const TodaySnapshot = ({ items, suggestion }: Props) => {
  return (
    <Card className="border-border/60 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg font-heading flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          Today's Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, i) => {
          const cfg = statusConfig[item.status];
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center gap-3 p-2.5 rounded-lg ${cfg.bg}`}
            >
              <cfg.Icon className={`w-4 h-4 ${cfg.color} shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-sm font-medium text-foreground truncate">{item.value}</div>
              </div>
            </motion.div>
          );
        })}
        <div className="mt-3 p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-semibold text-primary uppercase tracking-wide">Suggestion</div>
              <p className="text-xs text-foreground mt-0.5">{suggestion}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
