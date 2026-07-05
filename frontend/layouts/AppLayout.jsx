/**
 * AppLayout — Cursor-inspired monochrome dashboard shell.
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
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

function SidebarLink({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => (isActive ? "sidebar-link-active" : "sidebar-link")}
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
      <span>{label}</span>
    </NavLink>
  );
}

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
      <div className="px-4 py-6 border-b border-surface-border-dark">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-inverse">AccessAI</p>
        <p className="text-xs text-neutral-500 mt-1">Improve Access</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} onClick={closeSidebar} />
        ))}
      </nav>

      <div className="px-2 py-4 border-t border-surface-border-dark space-y-1">
        <button type="button" onClick={toggleTheme} className="sidebar-link w-full" aria-label="Toggle theme">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{isDark ? "Light mode" : "Dark mode"}</span>
        </button>

        {user && (
          <div className="px-3 py-3 rounded-lg border border-surface-border-light bg-surface-card mt-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center text-sm font-semibold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <button type="button" onClick={handleLogout} className="sidebar-link w-full">
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-canvas-dark">
      <aside className="hidden lg:flex flex-col w-60 border-r border-surface-border-dark bg-canvas-dark">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 lg:hidden"
              onClick={closeSidebar}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 flex flex-col w-60 bg-canvas-dark border-r border-surface-border-dark lg:hidden"
            >
              <button
                type="button"
                onClick={closeSidebar}
                className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-ink-inverse"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 px-4 py-3 border-b border-surface-border-dark lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-neutral-400 hover:text-ink-inverse"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-inverse">AccessAI</span>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
