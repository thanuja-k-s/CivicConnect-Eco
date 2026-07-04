import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services/notificationService";
import {
  Shield,
  Leaf,
  Calendar,
  Trophy,
  Globe,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  FileText,
  Search,
  Bell,
  Users,
  ChevronLeft,
  ChevronRight,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll notification badge count when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) { setUnreadCount(0); return; }
    const fetchCount = () => {
      notificationService.getUnreadCount(Number(user.id))
        .then(setUnreadCount)
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
        : user?.role === "ngo"
          ? "/ngo/dashboard"
          : "/dashboard";

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // Build nav items
  const publicNavItems = [
    { to: "/events", icon: Calendar, label: "Events" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/eco-impact", icon: Globe, label: "Eco Impact" },
  ];

  const authNavItems = isAuthenticated
    ? [
        { to: dashboardPath, icon: LayoutDashboard, label: "Dashboard" },
        ...(user?.role !== "worker"
          ? [
              { to: "/report", icon: FileText, label: "Report Issue" },
              { to: "/track", icon: Search, label: "Track" },
            ]
          : []),
        ...(user?.role === "citizen" || user?.role === "ngo"
          ? [{ to: "/ngo/dashboard", icon: Users, label: "NGO" }]
          : []),
        {
          to: "/notifications",
          icon: Bell,
          label: "Notifications",
          badge: unreadCount,
        },
      ]
    : [
        { to: "/login", icon: LogIn, label: "Login" },
        { to: "/register", icon: UserPlus, label: "Register" },
      ];

  const allNavItems = [...publicNavItems, ...authNavItems];

  const NavItem = ({
    to,
    icon: Icon,
    label,
    badge,
  }: {
    to: string;
    icon: React.ElementType;
    label: string;
    badge?: number;
  }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        title={collapsed ? label : undefined}
        className={cn(
          "sidebar-nav-item group",
          active ? "sidebar-nav-item-active" : "sidebar-nav-item-inactive"
        )}
      >
        <span className="sidebar-icon-wrap relative flex-shrink-0">
          <Icon size={18} />
          {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </span>
        {!collapsed && (
          <span className="sidebar-label truncate">{label}</span>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="sidebar-inner">
      {/* Logo */}
      <div className="sidebar-logo-section">
        <Link to="/" className="sidebar-logo-link">
          <span className="sidebar-logo-icon">
            <Shield size={22} strokeWidth={2.5} />
          </span>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-title">CivicConnect</span>
              <span className="sidebar-logo-sub">
                <Leaf size={9} className="inline-block mr-0.5" />
                ECO
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle – desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-collapse-btn"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {allNavItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Bottom section */}
      <div className="sidebar-bottom">
        {isAuthenticated && user ? (
          <>
            {/* User profile */}
            <div
              className={cn(
                "sidebar-user",
                collapsed && "justify-center"
              )}
              title={collapsed ? `${user.name || user.username}` : undefined}
            >
              <div className="sidebar-avatar">
                {(user.name || user.username || "U").charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="sidebar-user-info">
                  <p className="sidebar-user-name truncate">
                    {user.name || user.username}
                  </p>
                  <p className="sidebar-user-role capitalize">{user.role}</p>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title={collapsed ? "Logout" : undefined}
              className={cn(
                "sidebar-nav-item sidebar-nav-item-inactive mt-1",
                collapsed && "justify-center"
              )}
            >
              <LogOut size={18} className="flex-shrink-0" />
              {!collapsed && <span className="sidebar-label">Logout</span>}
            </button>
          </>
        ) : (
          <p className="sidebar-hint">
            {!collapsed ? "Sign in to access all features" : ""}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="sidebar-mobile-toggle"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sidebar-desktop",
          collapsed ? "sidebar-collapsed" : "sidebar-expanded"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={cn(
          "sidebar-mobile",
          mobileOpen ? "sidebar-mobile-open" : "sidebar-mobile-closed"
        )}
      >
        {/* Force expanded in mobile */}
        <div className="sidebar-inner">
          {/* Logo */}
          <div className="sidebar-logo-section">
            <Link to="/" className="sidebar-logo-link">
              <span className="sidebar-logo-icon">
                <Shield size={22} strokeWidth={2.5} />
              </span>
              <div className="sidebar-logo-text">
                <span className="sidebar-logo-title">CivicConnect</span>
                <span className="sidebar-logo-sub">
                  <Leaf size={9} className="inline-block mr-0.5" />
                  ECO
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="sidebar-collapse-btn"
            >
              <X size={14} />
            </button>
          </div>
          <div className="sidebar-divider" />
          <nav className="sidebar-nav">
            {allNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "sidebar-nav-item",
                  isActive(item.to)
                    ? "sidebar-nav-item-active"
                    : "sidebar-nav-item-inactive"
                )}
              >
                <span className="sidebar-icon-wrap relative flex-shrink-0">
                  <item.icon size={18} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </span>
                <span className="sidebar-label truncate">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex-1" />
          <div className="sidebar-divider" />
          <div className="sidebar-bottom">
            {isAuthenticated && user ? (
              <>
                <div className="sidebar-user">
                  <div className="sidebar-avatar">
                    {(user.name || user.username || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="sidebar-user-info">
                    <p className="sidebar-user-name truncate">{user.name || user.username}</p>
                    <p className="sidebar-user-role capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="sidebar-nav-item sidebar-nav-item-inactive mt-1"
                >
                  <LogOut size={18} className="flex-shrink-0" />
                  <span className="sidebar-label">Logout</span>
                </button>
              </>
            ) : (
              <p className="sidebar-hint">Sign in to access all features</p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
