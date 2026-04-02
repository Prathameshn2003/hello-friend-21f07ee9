import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Heart, Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden hero-gradient pt-20 pb-8">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-16 left-[5%] w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(345 58% 62% / 0.25), transparent 70%)' }}
          animate={{ y: [-10, 15, -10], x: [-5, 10, -5], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 right-[8%] w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(170 45% 42% / 0.2), transparent 70%)' }}
          animate={{ y: [10, -15, 10], x: [5, -10, 5], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-[30%] w-48 h-48 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(12 85% 62% / 0.15), transparent 70%)' }}
          animate={{ y: [5, -20, 5], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-card/70 backdrop-blur-md border border-primary/20 mb-8 shadow-sm"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
            </span>
            <span className="text-sm font-medium text-foreground">
              AI-Powered Women's Health Platform
            </span>
            <Sparkles className="w-4 h-4 text-gold" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6"
          >
            Your Health,{" "}
            <span className="gradient-text">Reimagined</span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl opacity-90">
              with Intelligence & Care
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Track your cycle, predict health risks, and get personalized insights — 
            all in one beautiful, private platform designed for <strong className="text-foreground">every woman</strong>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link to="/signup">
              <Button variant="hero" size="xl" className="group min-w-[200px]">
                Start Free Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/modules">
              <Button variant="glass" size="xl" className="min-w-[200px]">
                Explore Modules
              </Button>
            </Link>
          </motion.div>

          {/* Trust Row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
          >
            {[
              { icon: Sparkles, label: "AI-Powered Predictions", color: "text-primary" },
              { icon: Heart, label: "Doctor-Backed Insights", color: "text-accent" },
              { icon: Shield, label: "100% Private & Secure", color: "text-teal" },
              { icon: Star, label: "Trusted by Thousands", color: "text-gold" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 group cursor-default">
                <div className={`w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center shadow-xs group-hover:shadow-md transition-shadow duration-300`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Curve */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path
            d="M0 80L48 74C96 68 192 56 288 48C384 40 480 36 576 38C672 40 768 48 864 52C960 56 1056 56 1152 52C1248 48 1344 40 1392 36L1440 32V80H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};
