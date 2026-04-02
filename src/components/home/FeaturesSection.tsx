import { Link } from "react-router-dom";
import { 
  Calendar, 
  Activity, 
  Thermometer, 
  Salad, 
  MessageCircle, 
  Stethoscope,
  ArrowRight,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Calendar,
    title: "Menstrual Tracking",
    description: "Smart cycle predictions, symptom logging, and personalized health insights powered by machine learning.",
    color: "primary",
    emoji: "🩸",
    path: "/modules/menstrual",
  },
  {
    icon: Activity,
    title: "PCOS Risk Assessment",
    description: "AI-driven risk analysis with explainable results and clear, actionable health recommendations.",
    color: "accent",
    emoji: "💜",
    path: "/modules/pcos",
  },
  {
    icon: Thermometer,
    title: "Menopause Insights",
    description: "Understand your stage with intelligent predictions, symptom tracking, and personalized guidance.",
    color: "teal",
    emoji: "🌸",
    path: "/modules/menopause",
  },
  {
    icon: Salad,
    title: "Diet & Wellness Plans",
    description: "Nutrition and exercise recommendations tailored specifically to your health profile and goals.",
    color: "gold",
    emoji: "🥗",
    path: "/hygiene",
  },
  {
    icon: MessageCircle,
    title: "AI Health Assistant",
    description: "24/7 intelligent chatbot for instant health guidance, symptom checking, and empathetic support.",
    color: "primary",
    emoji: "🤖",
    path: "/chatbot",
  },
  {
    icon: Stethoscope,
    title: "Doctor Connect",
    description: "Find verified healthcare providers, access government schemes, and connect with specialists near you.",
    color: "teal",
    emoji: "👩‍⚕️",
    path: "/doctors",
  },
];

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  primary: { bg: "bg-primary/10", icon: "text-primary", border: "group-hover:border-primary/30" },
  accent: { bg: "bg-accent/10", icon: "text-accent", border: "group-hover:border-accent/30" },
  teal: { bg: "bg-teal/10", icon: "text-teal", border: "group-hover:border-teal/30" },
  gold: { bg: "bg-gold/10", icon: "text-gold", border: "group-hover:border-gold/30" },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export const FeaturesSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14 md:mb-18"
        >
          <span className="inline-block text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Health Modules
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
            Everything You Need,{" "}
            <span className="gradient-text">One Platform</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Six powerful AI-driven modules designed to give you complete control 
            over your health journey — from tracking to treatment.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {features.map((feature) => {
            const colors = colorMap[feature.color] || colorMap.primary;
            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <Link
                  to={feature.path}
                  className={`group feature-card block h-full ${colors.border}`}
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                      <feature.icon className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                    <span className="text-2xl">{feature.emoji}</span>
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-lg md:text-xl font-semibold text-foreground mb-2.5 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    {feature.description}
                  </p>

                  {/* Link */}
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Explore Module
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
