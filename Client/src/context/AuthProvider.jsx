import { useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const value = useMemo(() => {
    const login = ({ user: loggedInUser, token }) => {
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      localStorage.setItem('token', token);
      setUser(loggedInUser);
    };

    const logout = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    };

    const updateUser = (patch) => {
      setUser((prev) => {
        const next = { ...prev, ...patch };
        localStorage.setItem('user', JSON.stringify(next));
        return next;
      });
    };

    return { user, isAuthenticated: !!user, login, logout, updateUser };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
