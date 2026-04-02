import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Heart, Mail, Phone, ArrowUpRight } from "lucide-react";
import logoImg from "@/assets/logo.png";

const footerLinks = {
  product: [
    { name: "Features", path: "/modules" },
    { name: "Health Tracking", path: "/dashboard" },
    { name: "AI Chatbot", path: "/chatbot" },
    { name: "Find Doctors", path: "/doctors" },
  ],
  resources: [
    { name: "Health Education", path: "/education" },
    { name: "Health Resources", path: "/health-resources" },
    { name: "Hygiene Tips", path: "/hygiene" },
    { name: "Government Schemes", path: "/schemes" },
  ],
  company: [
    { name: "About Us", path: "/about" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Contact", path: "/contact" },
  ],
};

export const Footer = forwardRef<HTMLElement>((props, ref) => {
  return (
    <footer ref={ref} className="bg-muted/30 border-t border-border/40">
      <div className="container mx-auto px-4 py-14 md:py-18">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <img src={logoImg} alt="NaariCare Logo" className="w-10 h-10 rounded-xl object-contain group-hover:scale-105 transition-transform" />
              <span className="font-heading font-bold text-xl text-foreground">
                Naari<span className="text-primary">Care</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              AI-powered women's health platform providing personalized insights, 
              predictions, and guidance for every stage of your wellness journey.
            </p>
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <a href="mailto:support@naaricare.com" className="flex items-center gap-2.5 hover:text-primary transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                support@naaricare.com
              </a>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal/8 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-teal" />
                </div>
                +91 1800-XXX-XXXX
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-5 text-sm tracking-wide uppercase">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-5 text-sm tracking-wide uppercase">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-5 text-sm tracking-wide uppercase">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NaariCare. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-primary fill-primary animate-pulse-soft" />
            <span>for women's health</span>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
