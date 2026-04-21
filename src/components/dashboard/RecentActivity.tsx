import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Stethoscope, Droplets, Thermometer, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

export interface ActivityItem {
  id: string;
  type: "pcos" | "menopause" | "menstrual" | "document" | "doctor" | "cycle";
  title: string;
  subtitle: string;
  date: string; // ISO
}

interface Props {
  items: ActivityItem[];
}

const typeIcon = {
  pcos: { Icon: Activity, color: "text-accent", bg: "bg-accent/10" },
  menopause: { Icon: Thermometer, color: "text-primary", bg: "bg-primary/10" },
  menstrual: { Icon: Droplets, color: "text-teal", bg: "bg-teal/10" },
  cycle: { Icon: Droplets, color: "text-teal", bg: "bg-teal/10" },
  document: { Icon: FileText, color: "text-accent", bg: "bg-accent/10" },
  doctor: { Icon: Stethoscope, color: "text-success", bg: "bg-success/10" },
};

export const RecentActivity = ({ items }: Props) => {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base sm:text-lg font-heading">📁 Recent Activity</CardTitle>
        <Link to="/profile" className="text-xs text-primary hover:underline flex items-center gap-1">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No recent activity yet — start an assessment or upload a report.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => {
              const cfg = typeIcon[item.type];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <cfg.Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground shrink-0">
                    {format(parseISO(item.date), "dd MMM")}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
