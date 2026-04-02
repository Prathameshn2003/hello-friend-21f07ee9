import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  "Free forever — no credit card needed",
  "AI-powered health predictions",
  "Private & HIPAA-compliant data",
  "Personalized wellness insights",
];

export const CTASection = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section ref={ref} className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-teal/6" />
        <motion.div
          className="absolute top-10 right-[10%] w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(345 58% 62% / 0.15), transparent 70%)' }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-[10%] w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(170 45% 42% / 0.12), transparent 70%)' }}
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto"
        >
          {/* Glass Card CTA */}
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-card via-card/95 to-card/90 border border-border/30 rounded-3xl" />
            <div className="relative p-8 md:p-14 text-center">
              <span className="inline-block text-sm font-semibold text-teal tracking-wide uppercase mb-4">
                Join the Movement
              </span>
              
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 leading-tight">
                Take Control of{" "}
                <span className="gradient-text">Your Health</span> Today
              </h2>

              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
                Join thousands of women who use NaariCare to understand their bodies, 
                predict health changes, and live healthier lives.
              </p>

              {/* Benefits */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-10">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button variant="hero" size="xl" className="group min-w-[220px]">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="glass" size="xl" className="min-w-[180px]">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

CTASection.displayName = "CTASection";
