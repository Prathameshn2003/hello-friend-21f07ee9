import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Working Professional",
    avatar: "PS",
    text: "NaariCare has completely transformed how I manage my cycle. The predictions are incredibly accurate and the AI chatbot feels like talking to a caring friend.",
    rating: 5,
    color: "from-primary to-accent",
  },
  {
    name: "Dr. Ananya Reddy",
    role: "Gynecologist",
    avatar: "AR",
    text: "I recommend NaariCare to my patients. The PCOS risk assessment is remarkably aligned with clinical findings. An excellent tool for preventive care.",
    rating: 5,
    color: "from-teal to-primary",
  },
  {
    name: "Sneha Patel",
    role: "College Student",
    avatar: "SP",
    text: "As someone who was always confused about menstrual health, this app educated me so much. The diet plans and health resources are incredibly helpful!",
    rating: 5,
    color: "from-accent to-gold",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-block text-sm font-semibold text-teal tracking-wide uppercase mb-3">
            Testimonials
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
            Loved by <span className="gradient-text">Thousands</span> of Women
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Real stories from real women who took control of their health journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative group"
            >
              <div className="feature-card h-full flex flex-col">
                {/* Quote icon */}
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-primary/20" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 flex-1">
                  "{t.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
