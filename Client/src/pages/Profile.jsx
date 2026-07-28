import { useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setSavingName(true);
      const { data } = await api.patch('/users/profile', { name });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingPassword(true);
      await api.patch('/users/password', passwords);
      toast.success('Password updated');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Profile</h2>

          <form
            onSubmit={handleNameSubmit}
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4"
          >
            <h3 className="font-medium text-gray-700 dark:text-gray-200">Account details</h3>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={savingName}
              className="bg-green-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-600 transition-all duration-200 disabled:opacity-60"
            >
              {savingName ? 'Saving...' : 'Save changes'}
            </button>
          </form>

          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4"
          >
            <h3 className="font-medium text-gray-700 dark:text-gray-200">Change password</h3>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Current password</label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                required
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">New password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                minLength={6}
                required
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200 disabled:opacity-60"
            >
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
