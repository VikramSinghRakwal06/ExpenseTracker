import toast from 'react-hot-toast';
import { Moon, Sun, LogOut } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Settings</h2>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-200">Appearance</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Switch between light and dark mode.
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-200">Currency</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Amounts are displayed in Indian Rupees (₹).
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-200">Sign out</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                End your current session on this device.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200"
            >
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
