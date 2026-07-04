/**
 * AppLayout — shared dashboard shell with responsive sidebar.
 *
 * Wraps Dashboard, History, and Settings pages with navigation,
 * user profile, and a mobile-friendly collapsible sidebar.
 */
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

/** Sidebar navigation items */
const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

/**
 * Single sidebar navigation link with active state styling.
 */
function SidebarLink({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        isActive ? "sidebar-link-active" : "sidebar-link"
      }
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

/**
 * Dashboard layout with sidebar and main content area.
 */
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarContent = (
    <>
      {/* Brand header */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-brand shadow-glow">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">AccessAI</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Improve Access</p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <SidebarLink
            key={item.to}
            {...item}
            onClick={closeSidebar}
          />
        ))}
      </nav>

      {/* Footer: theme toggle + user + logout */}
      <div className="px-3 py-4 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="sidebar-link w-full"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {user && (
          <div className="px-4 py-3 rounded-xl bg-brand-50/80 dark:bg-slate-700/40">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-link w-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-surface-muted dark:bg-surface-dark">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-72 glass-strong border-r border-slate-200/40 dark:border-slate-700/40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={closeSidebar}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 glass-strong lg:hidden"
            >
              <button
                type="button"
                onClick={closeSidebar}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="flex items-center gap-4 px-4 py-3 glass border-b border-slate-200/40 dark:border-slate-700/40 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-brand-50 dark:hover:bg-slate-700"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span className="font-bold text-slate-800 dark:text-white">AccessAI</span>
          </div>
        </header>

        {/* Page content rendered by React Router */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
