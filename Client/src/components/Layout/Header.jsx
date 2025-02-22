import React, { useEffect, useState } from "react";
import { Menu, User, Bell, LogOut, Settings, BarChart, Home, DollarSign, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setLoginUser(user);
    } else {
      navigate("/login");
    }
  }, []);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    localStorage.removeItem("user");
    setLoginUser(null);
    navigate("/login");
    toast.success('LoggedOut Successfully')
  };

  const currentPath = window.location.pathname;
  const navigation = [
    { name: "Dashboard", href: "/", icon: <Home size={18} /> },
    { name: "Transactions", href: "/transactions", icon: <DollarSign size={18} /> },
    { name: "Analytics", href: "/analytics", icon: <BarChart size={18} /> },
  ].map((item) => ({
    ...item,
    current: item.href === currentPath,
  }));

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              <Menu size={24} />
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
                      item.current
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
            {/* Username display */}
            <div className="hidden sm:block">
              <span className="text-gray-300">
                Welcome, {loginUser?.name || "Guest"} {/* Display the username */}
              </span>
            </div>

            {/* Notifications */}
            <button className="rounded-full p-1 text-gray-400 hover:text-white">
              <Bell size={20} />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                  {loginUser?.name?.charAt(0)?.toUpperCase() || 'G'}
                </div>
                <ChevronDown size={16} />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User size={16} />
                    Your Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
      </div>
    </nav>
  );
}