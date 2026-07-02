import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/services/notificationService";
import { Menu, X, Sun, Moon, Shield, Leaf, Bell, Trophy, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll notification badge count when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) { setUnreadCount(0); return; }
    const fetch = () => {
      notificationService.getUnreadCount(Number(user.id))
        .then(setUnreadCount)
        .catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const close = () => setMobileOpen(false);

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "worker"
        ? "/worker"
        : user?.role === "ngo"
          ? "/ngo/dashboard"
          : "/dashboard";

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link to={to} onClick={close}
      className={cn(
        "text-sm font-medium transition-colors",
        isActive(to) ? "text-saffron" : "hover:text-saffron"
      )}>
      {children}
    </Link>
  );

  const navLinks = (
    <>
      {/* Eco public links – always visible */}
      <NavLink to="/events">🌿 Events</NavLink>
      <NavLink to="/leaderboard"><Trophy className="inline h-3.5 w-3.5 mr-0.5" />Leaderboard</NavLink>
      <NavLink to="/eco-impact">🌍 Eco Impact</NavLink>

      {/* Complaint management – for non-worker logged-in users */}
      {isAuthenticated && user?.role !== "worker" && (
        <>
          <NavLink to="/report">Report Issue</NavLink>
          <NavLink to="/track">Track</NavLink>
        </>
      )}

      {isAuthenticated ? (
        <>
          <NavLink to={dashboardPath}>Dashboard</NavLink>

          {/* NGO dashboard link for non-admin, non-worker */}
          {(user?.role === "citizen" || user?.role === "ngo") && (
            <NavLink to="/ngo/dashboard"><Leaf className="inline h-3.5 w-3.5 mr-0.5" />NGO</NavLink>
          )}

          {/* Notification bell */}
          <Link to="/notifications" onClick={close}
            className="relative p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Button variant="outline" size="sm" onClick={handleLogout}
            className="border-saffron text-saffron hover:bg-saffron hover:text-saffron-foreground">
            Logout
          </Button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={close} className="hover:text-saffron transition-colors text-sm font-medium">Login</Link>
          <Link to="/register" onClick={close}>
            <Button size="sm" className="bg-saffron text-saffron-foreground hover:bg-saffron/90">Register</Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-navy text-navy-foreground shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-saffron" />
          <div className="leading-tight">
            <span className="text-lg font-bold tracking-tight">CivicConnect</span>
            <span className="block text-[10px] text-saffron font-medium tracking-wider uppercase">
              <Leaf className="inline h-2.5 w-2.5 mr-0.5" />Eco
            </span>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-5 text-sm font-medium">
          {navLinks}
          <button onClick={toggleDark} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleDark} className="p-2">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy border-t border-navy/50 px-4 py-4 flex flex-col gap-4 text-sm font-medium animate-fade-in-up">
          {navLinks}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
