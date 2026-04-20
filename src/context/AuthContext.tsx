import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  phone: string;
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, otp: string) => Promise<boolean>;
  loginAdmin: (password: string) => Promise<boolean>;
  requestOTP: (phone: string) => Promise<any>;
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

  const requestOTP = async (phone: string) => {
    try {
      const res = await fetch(`${API}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (res.ok) return await res.json();
      return null;
    } catch {
      return null;
    }
  };

  const loginAdmin = async (password: string) => {
    const secret = import.meta.env.VITE_ADMIN_PASSWORD;
    if (password === secret) {
      const newUser = { phone: 'ADMIN_SESSION', is_admin: true };
      setUser(newUser);
      localStorage.setItem('vip_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const login = async (phone: string, otp: string) => {
    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      if (res.ok) {
        const data = await res.json();
        const newUser = { phone: data.phone, is_admin: data.is_admin };
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
    <AuthContext.Provider value={{ user, login, loginAdmin, requestOTP, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
