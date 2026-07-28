import { useEffect, useRef, useState } from "react";
import {
  Menu,
  User,
  LogOut,
  Settings,
  BarChart,
  Home,
  DollarSign,
  ChevronDown,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: <Home size={18} /> },
  { name: "Transactions", href: "/transactions", icon: <DollarSign size={18} /> },
  { name: "Analytics", href: "/analytics", icon: <BarChart size={18} /> },
];

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close the profile dropdown when clicking anywhere outside it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Collapse menus on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo and desktop navigation */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <span className="text-white text-xl font-bold">ExpenseTracker</span>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      item.href === pathname
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    } flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition duration-200`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* User section */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <span className="text-gray-300">Welcome, {user?.name || "Guest"}</span>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="rounded-full p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition duration-200"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-label="Open user menu"
                className="flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "G"}
                </div>
                <ChevronDown size={16} />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User size={16} />
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <div className="sm:hidden pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  item.href === pathname
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                } flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
