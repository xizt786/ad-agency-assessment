import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Sun,
  Moon,
  Megaphone,
} from "lucide-react";

export default function Sidebar({ isDark, toggleDark }) {
  const navItems = [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/brief", label: "Brief Builder", icon: <FileText size={18} /> },
    { to: "/settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-60 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between py-8 px-3 flex-shrink-0">

      {/* Logo */}
      <div>
        <div className="flex items-center gap-2 mb-8 px-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Megaphone size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            AdFlow
          </span>
        </div>

        {/* Label */}
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-2">
          Menu
        </p>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom — Dark Mode Toggle */}
      <div className="px-1">
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <button
            onClick={toggleDark}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>

    </aside>
  );
}