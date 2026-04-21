import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  phone: string;
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
if (API && !API.startsWith('http')) API = `https://${API}`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('vip_user');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const register = async (phone: string, password: string) => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      if (res.ok) {
        const data = await res.json();
        const newUser = { phone: data.user.phone, is_admin: data.user.role === 'admin' };
        setUser(newUser);
        localStorage.setItem('vip_user', JSON.stringify(newUser));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const login = async (phone: string, password: string) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      if (res.ok) {
        const data = await res.json();
        const newUser = { phone: data.user.phone, is_admin: data.user.is_admin };
        setUser(newUser);
        localStorage.setItem('vip_user', JSON.stringify(newUser));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vip_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
