import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

/** Access the signed-in user and the login/logout helpers. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
