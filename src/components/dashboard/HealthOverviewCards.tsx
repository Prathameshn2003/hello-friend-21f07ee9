import { Link } from "react-router-dom";
import { ChevronRight, Sparkles, Calendar, Clock, LucideIcon } from "lucide-react";
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

interface Props {
  cards: HealthCard[];
}

export const HealthOverviewCards = ({ cards }: Props) => {
  return (
    <div>
      <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground mb-3">📊 Health Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Link
              to={card.path}
              className="block rounded-2xl p-4 sm:p-5 bg-card border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group h-full"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-heading text-sm sm:text-base font-semibold text-foreground mb-1">{card.title}</h3>

              {card.hasData ? (
                <>
                  <p className={`text-xs sm:text-sm font-medium ${card.statusColor} mb-3`}>{card.status}</p>
                  {card.predictedDate ? (
                    <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/15">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Calendar className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-medium text-primary uppercase tracking-wide">Next Period</span>
                      </div>
                      <div className="text-sm font-semibold text-foreground">{card.predictedDate}</div>
                      {card.daysUntil != null && card.daysUntil > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{card.daysUntil} days away</span>
                        </div>
                      )}
                    </div>
                  ) : card.metric ? (
                    <div className="pt-3 border-t border-border/60">
                      <div className="text-2xl font-bold gradient-text">{card.metric}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{card.metricLabel}</div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">No assessment yet</p>
                  <div className="pt-3 border-t border-border/60 flex items-center gap-2 text-primary text-xs sm:text-sm font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    Start Assessment
                  </div>
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
