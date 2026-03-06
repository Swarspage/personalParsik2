import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import {
  ShoppingBag,
  Menu as MenuIcon,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Coffee,
  Scan,
  UtensilsCrossed,
  Info,
  LogOut as LogOutIcon,
  UserPlus,
  LogIn
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CartDrawer } from "./CartDrawer";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { items, isOpen, setIsOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Home", icon: <Coffee className="w-4 h-4" /> },
    { href: "/menu", label: "Menu", icon: <UtensilsCrossed className="w-4 h-4" /> },
    { href: "/scan", label: "Scan & Order", icon: <Scan className="w-4 h-4" /> },
    { href: "/reservation", label: "Booking", icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "py-3 bg-white/80 backdrop-blur-xl border-b border-border/40 shadow-sm"
          : "py-5 bg-transparent"
          }`}
      >
        <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-6 transition-all text-sm font-bold">P</div>
            <span className="font-display text-2xl text-primary font-normal">Parsik <span className="text-accent italic">elite</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} active={location === link.href} />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <UserMenu />
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all active:scale-90"
              onClick={() => setIsOpen(true)}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {totalItemsCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2.5 -right-2.5"
                    >
                      <Badge className="h-4.5 min-w-[18px] px-1 bg-accent text-white flex items-center justify-center font-bold text-[9px] rounded-full border-2 border-white shadow-xl shadow-accent/20">
                        {totalItemsCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="lg:hidden h-10 w-10 rounded-xl bg-muted/30 text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </Button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-primary/20 backdrop-blur-md z-[60]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-[70] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 font-bold text-sm">P</div>
                  <span className="font-display text-xl text-primary font-normal">Parsik <span className="text-accent italic lowercase">elite</span></span>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-muted/20" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-primary/60" />
                </Button>
              </div>

              <div className="flex-1 space-y-3">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer ${location === link.href
                      ? "bg-primary text-white shadow-xl shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted/50"
                      }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${location === link.href ? "bg-white/10" : "bg-muted/30"}`}>
                        {link.icon}
                      </div>
                      <span className="font-semibold text-sm tracking-tight">{link.label}</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="pt-8 border-t border-border/60">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-30 text-center">
                  Parsik Elite • Excellence Standard
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function NavLink({ href, label, active, icon }) {
  return (
    <Link href={href}>
      <div className="relative flex items-center gap-2 cursor-pointer group px-1 py-1">
        <span className={`text-[11px] font-semibold tracking-tight transition-colors duration-300 ${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>
          {label}
        </span>
        {active && (
          <motion.div
            layoutId="nav-active"
            className="absolute bottom-0 left-1 right-1 h-0.5 bg-accent rounded-full"
          />
        )}
      </div>
    </Link>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Button
        size="icon"
        variant="ghost"
        className={`h-10 w-10 rounded-xl transition-all active:scale-90 ${isOpen || user ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-primary/5 text-primary hover:bg-primary/10"}`}
      >
        <User className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-2 z-50 origin-top-right overflow-hidden"
          >
            {user ? (
              <>
                <div className="p-3 border-b border-border/50 mb-2 bg-primary/5 rounded-xl">
                  <p className="font-semibold text-primary truncate">{user.fullName || user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </div>
                <Link href="/profile">
                  <Button variant="ghost" className="w-full justify-start text-sm h-10 hover:bg-primary/5 rounded-xl font-medium">
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </Button>
                </Link>
                {user._type === "admin" && (
                  <Link href="/admin/dashboard">
                    <Button variant="ghost" className="w-full justify-start text-sm h-10 hover:bg-primary/5 rounded-xl font-medium">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <div className="h-px bg-border/50 my-1"></div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-10 hover:bg-destructive/10 hover:text-destructive rounded-xl font-medium text-muted-foreground"
                  onClick={() => logout()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <div className="p-3 mb-1 text-center">
                  <p className="font-display text-lg text-primary mb-1">Welcome</p>
                  <p className="text-xs text-muted-foreground">Sign in to manage your orders & reservations.</p>
                </div>
                <Link href="/auth">
                  <Button className="w-full mb-2 shadow-md shadow-primary/20 rounded-xl h-10">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth?tab=register">
                  <Button variant="outline" className="w-full rounded-xl h-10 border-primary/20 hover:bg-primary/5">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
