import { Link } from "react-router-dom";
import { Activity, Droplets, Upload, Stethoscope, Thermometer, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  { icon: Activity, label: "PCOS Test", path: "/modules/pcos", from: "from-accent/20", to: "to-accent/5", iconColor: "text-accent" },
  { icon: Droplets, label: "Log Period", path: "/modules/menstrual", from: "from-teal/20", to: "to-teal/5", iconColor: "text-teal" },
  { icon: Thermometer, label: "Menopause", path: "/modules/menopause", from: "from-primary/20", to: "to-primary/5", iconColor: "text-primary" },
  { icon: Upload, label: "Upload Report", path: "/dashboard/documents", from: "from-secondary/30", to: "to-secondary/5", iconColor: "text-foreground" },
  { icon: Stethoscope, label: "Find Doctor", path: "/doctors", from: "from-success/20", to: "to-success/5", iconColor: "text-success" },
  { icon: MessageCircle, label: "Ask AI", path: "/chatbot", from: "from-warning/20", to: "to-warning/5", iconColor: "text-warning" },
];

export const QuickActions = () => {
  return (
    <div>
      <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground mb-3">⚡ Quick Actions</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {actions.map((a, i) => (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              to={a.path}
              className={`group flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-gradient-to-br ${a.from} ${a.to} border border-border/40 hover:border-primary/40 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <a.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${a.iconColor}`} />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-foreground text-center leading-tight">{a.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
