import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, Shield } from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "worker"
        ? "/worker"
        : "/dashboard";

  const navLinks = (
    <>
      <Link to="/" className="hover:text-saffron transition-colors" onClick={() => setMobileOpen(false)}>Home</Link>
      <Link to="/report" className="hover:text-saffron transition-colors" onClick={() => setMobileOpen(false)}>Report Issue</Link>
      <Link to="/track" className="hover:text-saffron transition-colors" onClick={() => setMobileOpen(false)}>Track Complaint</Link>
      {isAuthenticated ? (
        <>
          <Link to={dashboardPath} className="hover:text-saffron transition-colors" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-saffron text-saffron hover:bg-saffron hover:text-saffron-foreground">
            Logout
          </Button>
        </>
      ) : (
        <>
          <Link to="/login" className="hover:text-saffron transition-colors" onClick={() => setMobileOpen(false)}>Login</Link>
          <Link to="/register" onClick={() => setMobileOpen(false)}>
            <Button size="sm" className="bg-saffron text-saffron-foreground hover:bg-saffron/90">Register</Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-navy text-navy-foreground shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-saffron" />
          <div className="leading-tight">
            <span className="text-lg font-bold tracking-tight">NagarSeva</span>
            <span className="block text-[10px] text-saffron font-medium tracking-wider uppercase">Civic Issue Portal</span>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks}
          <button onClick={toggleDark} className="p-2 rounded-full hover:bg-navy/50 transition-colors">
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
