import { useState, memo, useCallback, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Shield, Download, ChevronDown } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Health Modules", path: "/modules" },
  { name: "Education", path: "/education" },
];

const authNavLinks = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Health Modules", path: "/modules" },
  { name: "AI Chatbot", path: "/chatbot" },
];

export const Header = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading, isAdmin } = useAuth();
  const { isInstallable, isInstalled, openPopup } = usePWAInstall();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/");
  }, [signOut, navigate]);

  const currentNavLinks = user ? authNavLinks : navLinks;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-background/85 backdrop-blur-2xl border-b border-border/40 shadow-sm" 
        : "bg-transparent border-b border-transparent"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img 
              src={logoImg} 
              alt="NaariCare Logo" 
              className="w-9 h-9 rounded-xl shadow-xs group-hover:shadow-md group-hover:scale-105 transition-all duration-300 object-contain" 
            />
            <span className="font-heading font-bold text-lg text-foreground">
              Naari<span className="text-primary">Care</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0.5">
            {currentNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {isInstallable && !isInstalled && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs border-primary/25 text-primary hover:bg-primary/8"
                onClick={openPopup}
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </Button>
            )}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xs">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-destructive" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="rounded-xl">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="sm" className="rounded-xl">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 rounded-xl hover:bg-muted/60 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-2xl border-b border-border/40 animate-fade-up shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-1">
              {currentNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary/12 text-primary"
                      : "text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 text-destructive hover:bg-destructive/8"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              {isInstallable && !isInstalled && (
                <button
                  onClick={() => { openPopup(); setIsMenuOpen(false); }}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 text-primary hover:bg-primary/8"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </button>
              )}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                {user ? (
                  <Button variant="outline" className="w-full rounded-xl" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link to="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl">Sign In</Button>
                    </Link>
                    <Link to="/signup" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="hero" className="w-full rounded-xl">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
});

Header.displayName = 'Header';
